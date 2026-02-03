package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.request.LoginRequestDTO;
import com.hostel.hostel_backend.controller.request.VerifyOtpRequestDTO;
import com.hostel.hostel_backend.controller.response.AuthResponse;
import com.hostel.hostel_backend.exception.AppException;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.User;
import com.hostel.hostel_backend.repository.UserRepository;
import com.hostel.hostel_backend.service.*;
import com.hostel.hostel_backend.util.JwtUtils;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final EmailProducer emailProducer;
    private final EmailService emailService;
    private final UserCacheService userCacheService;
    private final TotpService totpService;

    @Value("${auth.login.max-attempts}")
    private int maxFailedAttempts;

    @Value("${auth.login.lock-duration-minutes}")
    private long lockTimeDurationMinutes;

    @Override
    public void registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new AppException("Username is already taken!", HttpStatus.CONFLICT);
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new AppException("Email is already in use!", HttpStatus.CONFLICT);
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("STUDENT");
        }
        user.setFailedLoginAttempts(0);
        user.setMfaEnabled(false);
        userRepository.save(user);
    }

    @Override
    public AuthResponse login(LoginRequestDTO loginRequest) throws ResourceNotFoundException {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isAccountNonLocked()) {
            userCacheService.cacheUserStatus(user.getUsername(), false);
            throw new AppException("Account is locked. Try again later.", HttpStatus.FORBIDDEN);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

            // Reset failed attempts since password is correct
            if (user.getFailedLoginAttempts() > 0) {
                user.setFailedLoginAttempts(0);
                user.setAccountLockTime(null);
            }

            // ✅ NEW: CHECK IF 2FA IS DISABLED GLOBALLY FOR THIS USER
            if (!user.isTwoFactorEnabled()) {
                // If 2FA is OFF, generate token immediately
                String jwtToken = jwtUtils.generateToken(user);
                userCacheService.cacheUserStatus(user.getUsername(), true);
                userRepository.save(user);

                return AuthResponse.builder()
                        .token(jwtToken) // Send Token directly
                        .username(user.getUsername())
                        .role(user.getRole())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .email(user.getEmail())
                        .build();
            }

            // --- EXISTING 2FA LOGIC (Run only if 2FA is Enabled) ---

            user.setFailedOtpAttempts(0);
            userCacheService.cacheUserStatus(user.getUsername(), true);

            if (user.isMfaEnabled()) {
                userRepository.save(user);
                return AuthResponse.builder()
                        .username(user.getUsername())
                        .firstName("GOOGLE_AUTH_REQUIRED")
                        .build();
            } else {
                SecureRandom secureRandom = new SecureRandom();
                String otp = String.format("%06d", secureRandom.nextInt(999999));
                user.setTwoFactorOtp(otp);
                user.setTwoFactorOtpGeneratedTime(LocalDateTime.now());
                userRepository.save(user);

                Map<String, Object> variables = new HashMap<>();
                variables.put("name", user.getFirstName());
                variables.put("otp", otp);
                String body = emailService.getHtmlContent("login-otp-email", variables);
                emailProducer.sendEmail(user.getEmail(), "Login Verification Code", body);

                return AuthResponse.builder()
                        .username(user.getUsername())
                        .firstName("EMAIL_2FA_REQUIRED")
                        .build();
            }

        } catch (BadCredentialsException e) {
            increaseFailedAttempts(user);
            throw new AppException("Invalid Username or Password", HttpStatus.UNAUTHORIZED);
        }
    }

    @Override
    public AuthResponse verifyLoginOtp(VerifyOtpRequestDTO request) throws ResourceNotFoundException {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 1. Security Check: Prevent Brute Force (Common for both)
        if (user.getFailedOtpAttempts() >= 3) {
            throw new AppException("Too many failed attempts. Please login again.", HttpStatus.FORBIDDEN);
        }

        if (user.isMfaEnabled()) {
            // --- VERIFY GOOGLE AUTHENTICATOR CODE ---
            try {
                // Remove spaces if user typed them
                String cleanCode = request.getOtp().replace(" ", "");
                int code = Integer.parseInt(cleanCode);

                if (!totpService.verifyCode(user.getMfaSecret(), code)) {
                    incrementOtpFailures(user);
                    throw new AppException("Invalid Google Authenticator Code", HttpStatus.BAD_REQUEST);
                }
            } catch (NumberFormatException e) {
                throw new AppException("Invalid Code Format", HttpStatus.BAD_REQUEST);
            }

        } else {
            // --- VERIFY EMAIL OTP ---
            if (user.getTwoFactorOtp() == null || !user.getTwoFactorOtp().equals(request.getOtp())) {
                incrementOtpFailures(user);
                throw new AppException("Invalid Email OTP", HttpStatus.BAD_REQUEST);
            }

            if (user.getTwoFactorOtpGeneratedTime().plusMinutes(5).isBefore(LocalDateTime.now())) {
                throw new AppException("Email OTP Expired", HttpStatus.BAD_REQUEST);
            }

            // Clear Email OTP on success
            user.setTwoFactorOtp(null);
        }

        // --- SUCCESS ---
        // Reset counters and generate token
        user.setFailedOtpAttempts(0);
        userRepository.save(user);

        String jwtToken = jwtUtils.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .role(user.getRole())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getContactNumber())
                .build();
    }

    // --- NEW: 1. Enable MFA (Generate QR) ---
    @Override
    public AuthResponse enableMfa(String username) throws ResourceNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Generate a new secret key for Google Authenticator
        GoogleAuthenticatorKey key = totpService.generateSecret();

        // Save the secret temporarily or permanently (usually we save secret, but enable flag false)
        user.setMfaSecret(key.getKey());
        user.setMfaEnabled(false); // Not enabled until verified
        userRepository.save(user);

        // Generate QR Code URL
        String qrUrl = totpService.getQrCodeUrl(key.getKey(), user.getUsername());

        return AuthResponse.builder()
                .message("Scan this QR Code")
                .qrCodeUrl(qrUrl) // Sending URL to frontend
                .build();
    }

    // --- NEW: 2. Verify & Activate MFA ---
    @Override
    public AuthResponse verifyMfaSetup(String username, String otp) throws ResourceNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getMfaSecret() == null) {
            throw new AppException("MFA setup not initiated", HttpStatus.BAD_REQUEST);
        }

        try {
            // Remove spaces if any
            int code = Integer.parseInt(otp.replace(" ", ""));

            // Verify the code against the stored secret
            if (totpService.verifyCode(user.getMfaSecret(), code)) {
                user.setMfaEnabled(true); // ✅ Activate MFA
                userRepository.save(user);

                return AuthResponse.builder().message("MFA Enabled Successfully").build();
            } else {
                throw new AppException("Invalid Verification Code", HttpStatus.BAD_REQUEST);
            }
        } catch (NumberFormatException e) {
            throw new AppException("Invalid Code Format", HttpStatus.BAD_REQUEST);
        }
    }

    private void incrementOtpFailures(User user) {
        user.setFailedOtpAttempts(user.getFailedOtpAttempts() + 1);
        userRepository.save(user);
    }

    private void increaseFailedAttempts(User user) {
        int newFailAttempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(newFailAttempts);
        if (newFailAttempts >= maxFailedAttempts) {
            user.setAccountLockTime(LocalDateTime.now());
        }
        userRepository.save(user);
    }

    public void resendLoginOtp(String username) throws ResourceNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isAccountNonLocked()) {
            throw new AppException("Account is locked.", HttpStatus.FORBIDDEN);
        }

        // 1. අලුත් OTP එකක් හදන්න
        SecureRandom secureRandom = new SecureRandom();
        String otp = String.format("%06d", secureRandom.nextInt(999999));

        // 2. User ගේ OTP සහ වේලාව Update කරන්න (Renew Expiration for 5 mins)
        user.setTwoFactorOtp(otp);
        user.setTwoFactorOtpGeneratedTime(LocalDateTime.now()); // ✅ Reset Time
        user.setFailedOtpAttempts(0); // Reset attempts
        userRepository.save(user);

        // 3. Email එක යවන්න
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFirstName());
        variables.put("otp", otp);
        String body = emailService.getHtmlContent("login-otp-email", variables);
        emailProducer.sendEmail(user.getEmail(), "Resend: Login Verification Code", body);
    }

    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        SecureRandom secureRandom = new SecureRandom();
        String otp = String.format("%06d", secureRandom.nextInt(999999));
        user.setResetOtp(otp);
        user.setResetOtpGeneratedTime(LocalDateTime.now());
        userRepository.save(user);

        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFirstName());
        variables.put("otp", otp);
        String body = emailService.getHtmlContent("otp-email", variables);
        emailProducer.sendEmail(email, "Password Reset OTP", body);
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        // Check Reset OTP field
        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp)) {
            throw new AppException("Invalid OTP", HttpStatus.BAD_REQUEST);
        }
        if (user.getResetOtpGeneratedTime().plusMinutes(5).isBefore(LocalDateTime.now())) {
            throw new AppException("OTP Expired", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetOtp(null);
        userRepository.save(user);
    }
}