package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.exception.AppException;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.User;
import com.hostel.hostel_backend.repository.UserRepository;
import com.hostel.hostel_backend.service.EmailProducer;
import com.hostel.hostel_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService, UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailProducer emailProducer;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Override
    public void registerUser(User user) throws AppException {
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

    // පැරණි loginUser method එක අවශ්‍ය නම් තබා ගන්න, නමුත් AuthController එකේදි අපි අලුත් ක්‍රමය පාවිච්චි කරමු.
    @Override
    public User loginUser(String username, String password) throws ResourceNotFoundException, AppException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AppException("Invalid password", HttpStatus.UNAUTHORIZED);
        }
        return user;
    }


    // 1. Forgot Password - OTP යවන method එක (Updated Design)
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found with this email", HttpStatus.NOT_FOUND));

        // Random 6 digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // User ට OTP එක save කරමු
        user.setOtp(otp);
        user.setOtpGeneratedTime(LocalDateTime.now());
        userRepository.save(user);

        // Email Subject
        String subject = "🔑 Password Reset OTP - Hostel PMS";

        // Generate High-Quality HTML Body
        String body = generateOtpEmailTemplate(user.getFirstName(), otp);

        // Email යැවීම
        emailProducer.sendEmail(email, subject, body);
    }

    // --- High Quality Email Template Helper ---
    private String generateOtpEmailTemplate(String name, String otp) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<body style='font-family: \"Inter\", \"Segoe UI\", Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;'>" +
                "  <div style='max-width: 500px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;'>" +

                // Header (Logo & Brand)
                "    <div style='background-color: #4f46e5; padding: 30px; text-align: center;'>" +
                "      <h1 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;'>Hostel PMS</h1>" +
                "      <p style='color: #e0e7ff; margin: 5px 0 0; font-size: 14px;'>Security & Authentication</p>" +
                "    </div>" +

                // Body Content
                "    <div style='padding: 40px 30px; color: #374151; line-height: 1.6; text-align: center;'>" +
                "      <h2 style='color: #1f2937; margin-top: 0; font-size: 20px; font-weight: 700;'>Password Reset Request</h2>" +
                "      <p style='margin-bottom: 25px;'>Hello <strong>" + name + "</strong>,<br/>We received a request to reset the password for your account. Use the code below to proceed:</p>" +

                // OTP Box
                "      <div style='background-color: #f9fafb; border: 2px dashed #4f46e5; border-radius: 8px; padding: 15px; margin: 30px 0; display: inline-block;'>" +
                "        <span style='font-size: 32px; font-weight: 800; color: #4f46e5; letter-spacing: 5px; font-family: monospace;'>" + otp + "</span>" +
                "      </div>" +

                "      <p style='font-size: 13px; color: #6b7280; margin-top: 25px;'>This code is valid for <strong>5 minutes</strong> only.<br/>If you didn't request this, you can safely ignore this email.</p>" +
                "    </div>" +

                // Footer
                "    <div style='background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;'>" +
                "      <p style='margin: 0; color: #9ca3b8; font-size: 11px;'>&copy; 2025 Hostel Management System. All rights reserved.</p>" +
                "    </div>" +

                "  </div>" +
                "</body>" +
                "</html>";
    }

    // 2. Reset Password - OTP eka check karala password maru kirima
    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new AppException("Invalid OTP", HttpStatus.BAD_REQUEST);
        }

        // OTP eka expire welada balamu (Winadi 5k)
        if (user.getOtpGeneratedTime().plusMinutes(5).isBefore(LocalDateTime.now())) {
            throw new AppException("OTP Expired", HttpStatus.BAD_REQUEST);
        }

        // Password eka update karamu
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null); // OTP eka clear karanawa
        userRepository.save(user);
    }
}