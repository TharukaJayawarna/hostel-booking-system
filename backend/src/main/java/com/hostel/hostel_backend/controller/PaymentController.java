package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.response.ApiResponse;
import com.hostel.hostel_backend.controller.response.ReservationDetailResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping(value = "/notify", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public String handleNotify(@RequestParam Map<String, String> payload) {
        return paymentService.processPaymentNotification(payload);
    }

    @GetMapping(value = "/verify/{order-id}", headers = "X-Api-Version=v1")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STUDENT')")
    public ResponseEntity<ApiResponse<ReservationDetailResponseDTO>> verifyPayment(@PathVariable("order-id") String orderId) throws ResourceNotFoundException {
        return ResponseEntity.ok(ApiResponse.success("Payment status fetched", paymentService.verifyPayment(orderId)));
    }
}
