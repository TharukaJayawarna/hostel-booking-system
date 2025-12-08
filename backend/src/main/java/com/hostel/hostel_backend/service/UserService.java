package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.exception.AppException;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.User;

public interface UserService {
    void registerUser(User user) throws AppException;
    User loginUser(String username, String password) throws ResourceNotFoundException, AppException;
}