package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.exception.AppException;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.User;
import com.hostel.hostel_backend.repository.UserRepository;
import com.hostel.hostel_backend.service.AuthenticationService;
import com.hostel.hostel_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public void createUser(User user) {
        // Validation logic directly implemented here to break the cycle
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
    @Transactional
    public void deleteUser(Long id) throws ResourceNotFoundException {
        Integer userId = Math.toIntExact(id);

        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(userId);
    }

    @Override
    @Transactional
    public void updateUserTwoFactorStatus(String username, boolean enabled) throws ResourceNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setTwoFactorEnabled(enabled); // This saves the toggle status to DB
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void resetTwoFactorAuth(String username) throws ResourceNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setMfaEnabled(false);
        user.setMfaSecret(null);
        user.setTwoFactorEnabled(true); // Resetting usually means re-enabling email OTP

        userRepository.save(user);
    }
}