package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.controller.request.LoginRequestDTO;
import com.hostel.hostel_backend.controller.response.AuthResponse;
import com.hostel.hostel_backend.model.User;

public interface AuthenticationService {
    void registerUser(User user);
    AuthResponse login(LoginRequestDTO loginRequest);
    void forgotPassword(String email);
    void resetPassword(String email, String otp, String newPassword);
}