package com.hostel.hostel_backend.service;

import java.util.Map;

public interface PaymentService {
    String processPaymentNotification(Map<String, String> payload);
}
