package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
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
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public String handleNotify(@RequestParam Map<String, String> payload) {
        return paymentService.processPaymentNotification(payload);
    }
}
