package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.request.LoginRequestDTO;
import com.hostel.hostel_backend.controller.request.VerifyOtpRequestDTO;
import com.hostel.hostel_backend.controller.response.ApiResponse;
import com.hostel.hostel_backend.controller.response.AuthResponse;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.User;
import com.hostel.hostel_backend.service.AuthenticationService;
import com.hostel.hostel_backend.service.RateLimitService;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;
    private final RateLimitService rateLimitService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody User user) {
        try {
            authenticationService.registerUser(user);
            return ResponseEntity.ok(ApiResponse.success("User registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequestDTO loginRequest, HttpServletRequest request) throws ResourceNotFoundException {

        // Rate Limit by IP Address
        String ip = request.getRemoteAddr();
        Bucket bucket = rateLimitService.resolveBucket(ip);

        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body( ApiResponse.error("Too many login attempts. Please wait."));
        } AuthResponse response = authenticationService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to email. Please verify.", response));
    }

    // NEW ENDPOINT: Verify 2FA OTP
    @PostMapping("/verify-login")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyLogin(@Valid @RequestBody VerifyOtpRequestDTO verifyRequest) throws ResourceNotFoundException {
        AuthResponse response = authenticationService.verifyLoginOtp(verifyRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    // 1. Request to Enable MFA (Frontend sends: POST /auth/mfa/enable?username=...)
    @PostMapping("/mfa/enable")
    public ResponseEntity<ApiResponse<AuthResponse>> enableMfa(@RequestParam String username) {
        try {
            AuthResponse response = authenticationService.enableMfa(username);
            return ResponseEntity.ok(ApiResponse.success("QR Code Generated", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // 2. Verify and Activate MFA (Frontend sends: POST /auth/mfa/verify body={username, otp})
    @PostMapping("/mfa/verify")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyMfaSetup(@RequestBody VerifyOtpRequestDTO request) {
        try {
            // Reusing VerifyOtpRequestDTO since it has username & otp fields
            AuthResponse response = authenticationService.verifyMfaSetup(request.getUsername(), request.getOtp());
            return ResponseEntity.ok(ApiResponse.success("MFA Activated Successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<String>> resendOtp(@RequestParam String username) {
        try {
            authenticationService.resendLoginOtp(username);
            return ResponseEntity.ok(ApiResponse.success("New OTP sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Forgot password and reset password endpoints remain the same...
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            authenticationService.forgotPassword(email);
            return ResponseEntity.ok(ApiResponse.success("OTP sent to your email"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            String otp = payload.get("otp");
            String newPassword = payload.get("newPassword");

            authenticationService.resetPassword(email, otp, newPassword);
            return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}