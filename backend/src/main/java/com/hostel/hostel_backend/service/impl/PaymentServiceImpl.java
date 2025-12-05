package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.model.*;
import com.hostel.hostel_backend.repository.BedRepository;
import com.hostel.hostel_backend.repository.PaymentRepository;
import com.hostel.hostel_backend.repository.ReservationRepository;
import com.hostel.hostel_backend.service.EmailProducer;
import com.hostel.hostel_backend.service.PaymentService;
import com.hostel.hostel_backend.util.PayHereUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final BedRepository bedRepository;
    private final PayHereUtil payHereUtil;
    private final EmailProducer emailProducer;
    private final ReservationServiceImpl reservationService;

    @Value("${payhere.merchant.id}")
    private String merchantId;

    @Value("${payhere.merchant.secret}")
    private String merchantSecret;

    @Value("${admin.email}")
    private String ADMIN_EMAIL;

    @Override
    @Transactional
    public String processPaymentNotification(Map<String, String> payload) {

        String orderId = payload.get("order_id");
        String payhereAmount = payload.get("payhere_amount");
        String payhereCurrency = payload.get("payhere_currency");
        String statusCode = payload.get("status_code");
        String md5sig = payload.get("md5sig");

        // 1. Validate Hash
        String localHash = payHereUtil.generateHash(merchantId, orderId, Double.parseDouble(payhereAmount), payhereCurrency, merchantSecret);
        if (!localHash.equals(md5sig)) return "FAILED";

        // 2. Find Payment
        Optional<Payment> paymentOpt = paymentRepository.findByPaymentId(orderId);
        if (paymentOpt.isEmpty()) return "FAILED";

        Payment payment = paymentOpt.get();

        Double receivedAmount = Double.parseDouble(payhereAmount);
        if (payment.getPaymentAmount() != null && !payment.getPaymentAmount().equals(receivedAmount)) {
            System.err.println("Amount Mismatch! Expected: " + payment.getPaymentAmount() + ", Received: " + receivedAmount);
            return "FAILED";
        }

        Reservation reservation = payment.getReservation();

        // 3. Status Check
        if ("2".equals(statusCode)) { // Success
            return handleSuccess(payment, reservation, payhereAmount, orderId);
        } else if ("-1".equals(statusCode) || "-2".equals(statusCode)) { // Failed
            return handleFailure(payment, reservation);
        }

        return "OK";
    }

    private String handleSuccess(Payment payment, Reservation reservation, String payhereAmount, String orderId) {
        // Late Payment
        if (reservation != null && reservation.getReservationStatus() == ReservationStatus.REJECTED) {
            payment.setPaymentStatus(PaymentStatus.APPROVED);
            paymentRepository.save(payment);

            // Admin email
            String adminSubject = "URGENT: Late Payment Received - " + orderId;
            String adminBody = "A payment was received AFTER cancellation.\n\n" +
                    "Order ID: " + orderId + "\n" +
                    "Amount: " + payhereAmount + "\n" +
                    "Student Name: " + reservation.getStudentName() + "\n" +
                    "Reg Number: " + reservation.getStudentRegistrationNumber() + "\n\n" +
                    "ACTION: Please REFUND this manually.";
            emailProducer.sendEmail(ADMIN_EMAIL, adminSubject, adminBody);

            // Student email
            String studentSubject = "Payment Received - Booking Cancellation Alert";
            String studentBody = "Dear " + reservation.getStudentName() + ",\n\n" +
                    "We received your payment of LKR " + payhereAmount + ".\n" +
                    "However, your reservation time had expired before the payment was completed.\n\n" +
                    "Don't worry! Your payment has been recorded and a REFUND will be processed shortly.\n\n" +
                    "Reg No: " + reservation.getStudentRegistrationNumber() + "\n" +
                    "Reservation ID: " + reservation.getReservationNumber() + "\n\n" +
                    "Please contact support if you have questions.";
            emailProducer.sendEmail(reservation.getStudentEmail(), studentSubject, studentBody);

            return "OK";
        }

        // Normal Flow
        payment.setPaymentStatus(PaymentStatus.APPROVED);
        if (reservation != null) {
            reservation.setReservationStatus(ReservationStatus.COMPLETED);
            reservationRepository.save(reservation);
            reservationService.sendSuccessEmail(reservation);
        }
        paymentRepository.save(payment);
        return "OK";
    }

    private String handleFailure(Payment payment, Reservation reservation) {
        payment.setPaymentStatus(PaymentStatus.REJECTED);
        if (reservation != null) {
            reservation.setReservationStatus(ReservationStatus.REJECTED);

            Bed bed = reservation.getBed();
            if (bed != null) {
                bed.setIsBooked(false);
                bedRepository.save(bed);
            }
            reservationRepository.save(reservation);
            reservationService.sendFailureEmail(reservation);
        }
        paymentRepository.save(payment);
        return "OK";
    }
}
