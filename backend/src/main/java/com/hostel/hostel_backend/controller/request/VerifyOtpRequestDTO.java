package com.hostel.hostel_backend.controller.request;

import lombok.Data;

@Data
public class VerifyOtpRequestDTO {
    private String username;
    private String otp;
}