package com.hostel.hostel_backend.controller.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private String token;
    private String username;
    private String role;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String message;
    private String qrCodeUrl;
}