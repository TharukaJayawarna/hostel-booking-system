package com.hostel.hostel_backend.controller.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PayHereInitResponseDTO {
    private String merchantId;
    private String orderId;
    private Double amount;
    private String currency;
    private String hash;
    private String items;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String country;
}