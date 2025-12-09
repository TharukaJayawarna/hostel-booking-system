package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.controller.response.ReservationDetailResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;

import java.util.Map;

public interface PaymentService {
    String processPaymentNotification(Map<String, String> payload);
    ReservationDetailResponseDTO verifyPayment(String orderId) throws ResourceNotFoundException;
}
