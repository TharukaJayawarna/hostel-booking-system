package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.request.LoginRequestDTO;
import com.hostel.hostel_backend.controller.response.AuthResponse;
import com.hostel.hostel_backend.exception.AppException;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.User;
import com.hostel.hostel_backend.repository.UserRepository;
import com.hostel.hostel_backend.service.AuthenticationService;
import com.hostel.hostel_backend.service.EmailProducer;
import com.hostel.hostel_backend.service.EmailService;
import com.hostel.hostel_backend.util.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final EmailProducer emailProducer;
    private final EmailService emailService;

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
        userRepository.save(user);
    }

    @Override
    public AuthResponse login(LoginRequestDTO loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            User user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

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

        } catch (BadCredentialsException e) {
            throw new AppException("Invalid Username or Password", HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            throw new AppException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found with this email", HttpStatus.NOT_FOUND));

        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpGeneratedTime(LocalDateTime.now());
        userRepository.save(user);

        // Prepare Thymeleaf Context
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", user.getFirstName());
        variables.put("otp", otp);

        // Generate HTML using EmailService
        String body = emailService.getHtmlContent("otp-email", variables);
        String subject = "🔑 Password Reset OTP - Hostel PMS";

        emailProducer.sendEmail(email, subject, body);
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new AppException("Invalid OTP", HttpStatus.BAD_REQUEST);
        }
        if (user.getOtpGeneratedTime().plusMinutes(5).isBefore(LocalDateTime.now())) {
            throw new AppException("OTP Expired", HttpStatus.BAD_REQUEST);
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null);
        userRepository.save(user);
    }
}