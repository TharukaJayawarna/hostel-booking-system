package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.exception.AppException;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.User;
import com.hostel.hostel_backend.repository.UserRepository;
import com.hostel.hostel_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService, UserDetailsService { // Implements UserDetailsService

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
}