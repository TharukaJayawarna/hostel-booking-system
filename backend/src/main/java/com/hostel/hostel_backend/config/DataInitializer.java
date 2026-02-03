package com.hostel.hostel_backend.config;

import com.hostel.hostel_backend.model.User;
import com.hostel.hostel_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("jayawarnatharuka@gmail.com");
            admin.setContactNumber("0778702002");
            admin.setRole("ADMIN");

            userRepository.save(admin);
            System.out.println("Default Admin User Created Successfully!");
        }
    }
}