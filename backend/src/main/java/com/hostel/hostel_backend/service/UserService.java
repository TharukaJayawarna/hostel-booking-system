package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

public interface UserService extends UserDetailsService {
    List<User> getAllUsers();
    void createUser(User user);
    void deleteUser(Long id) throws ResourceNotFoundException;
}