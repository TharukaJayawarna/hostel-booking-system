package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.response.ApiResponse;
import com.hostel.hostel_backend.exception.AppException;
import com.hostel.hostel_backend.model.User;
import com.hostel.hostel_backend.service.UserService;
import com.hostel.hostel_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users fetched", userRepository.findAll()));
    }

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<String>> createUser(@RequestBody User user) {
        try {
            userService.registerUser(user);
            return ResponseEntity.ok(ApiResponse.success("User created successfully as " + user.getRole()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(Math.toIntExact(id))) {
            userRepository.deleteById(Math.toIntExact(id));
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
        }
        return ResponseEntity.badRequest().body(ApiResponse.error("User not found"));
    }
}