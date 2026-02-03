package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.controller.request.LoginRequestDTO;
import com.hostel.hostel_backend.controller.request.VerifyOtpRequestDTO;
import com.hostel.hostel_backend.controller.response.AuthResponse;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.User;

public interface AuthenticationService {
    void registerUser(User user);
    AuthResponse login(LoginRequestDTO loginRequest) throws ResourceNotFoundException;
    AuthResponse verifyLoginOtp(VerifyOtpRequestDTO verifyRequest) throws ResourceNotFoundException; // NEW METHOD
    void forgotPassword(String email);
    void resetPassword(String email, String otp, String newPassword);
    AuthResponse enableMfa(String username) throws ResourceNotFoundException;
    AuthResponse verifyMfaSetup(String username, String otp) throws ResourceNotFoundException;
    void resendLoginOtp(String username) throws ResourceNotFoundException;
}