package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.response.ReservationDetailResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
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
    private final NotificationServiceImpl notificationService;


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
//        String localHash = payHereUtil.generateHash(merchantId, orderId, Double.parseDouble(payhereAmount), payhereCurrency, merchantSecret);
//        if (!localHash.equals(md5sig)) return "FAILED";

        String localHash = payHereUtil.generateNotifyHash(merchantId, orderId, Double.parseDouble(payhereAmount), payhereCurrency, statusCode, merchantSecret);

        if (!localHash.equals(md5sig)) {
            System.err.println("Hash Mismatch! PayHere: " + md5sig + " vs Local: " + localHash);
            return "FAILED";
        }
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
        // Late Payment Scenario
        if (reservation != null && reservation.getReservationStatus() == ReservationStatus.REJECTED) {
            payment.setPaymentStatus(PaymentStatus.APPROVED);
            paymentRepository.save(payment);

            // 1. Admin Email (Late Payment) - මෙය එලෙසම තබන්න (Admin Alert එකක් නිසා)
            String adminSubject = "URGENT: Late Payment Received - " + orderId;
            String adminContent = "<p>A payment was received <strong>AFTER</strong> the reservation was cancelled.</p>" +
                    "<ul>" +
                    "<li><strong>Order ID:</strong> " + orderId + "</li>" +
                    "<li><strong>Amount:</strong> " + payhereAmount + "</li>" +
                    "<li><strong>Student:</strong> " + reservation.getStudentName() + " (" + reservation.getStudentRegistrationNumber() + ")</li>" +
                    "</ul>" +
                    "<p style='color: red; font-weight: bold;'>ACTION REQUIRED: Please process a manual REFUND.</p>";

            String adminBody = generateCommonEmailTemplate("Late Payment Alert 🚨", adminContent);
            emailProducer.sendEmail(ADMIN_EMAIL, adminSubject, adminBody);

            // 2. Student Notification (Email වෙනුවට)
            if (reservation.getUser() != null) {
                String studentSubject = "Payment Received - Booking Cancellation Alert";
                String studentContent = "<p>Dear " + reservation.getStudentName() + ",</p>" +
                        "<p>We received your payment of <strong>LKR " + payhereAmount + "</strong>.</p>" +
                        "<div style='background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 15px; margin: 20px 0; color: #9a3412;'>" +
                        "  However, your reservation time had expired before the payment was completed." +
                        "</div>" +
                        "<p>Don't worry! Your payment has been recorded and a <strong>REFUND</strong> will be processed shortly.</p>";

                // Email එක වෙනුවට Notification එක යවන්න
                notificationService.createNotification(reservation.getUser(), studentSubject, studentContent);
            }

            // පැරණි Email යැවීම ඉවත් කර ඇත:
            // String studentBody = generateCommonEmailTemplate("Payment Issue ⚠️", studentContent);
            // emailProducer.sendEmail(reservation.getStudentEmail(), studentSubject, studentBody);

            return "OK";
        }

        // Normal Flow
        payment.setPaymentStatus(PaymentStatus.APPROVED);
        if (reservation != null) {
            reservation.setReservationStatus(ReservationStatus.APPROVED);
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

    @Override
    public ReservationDetailResponseDTO verifyPayment(String orderId) throws ResourceNotFoundException {
        Reservation reservation = reservationRepository.findByReservationNumber(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found for Order ID: " + orderId));

        return ReservationDetailResponseDTO.builder()
                .id(reservation.getId())
                .reservationNumber(reservation.getReservationNumber())
                .status(reservation.getReservationStatus())
                .paymentStatus(reservation.getPayment() != null ? reservation.getPayment().getPaymentStatus() : null)
                .studentName(reservation.getStudentName())
                .studentEmail(reservation.getStudentEmail())
                .build();
    }

    private String generateCommonEmailTemplate(String title, String content) {
        return "<html>" +
                "<body style='font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;'>" +
                "  <div style='max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>" +
                "    <div style='background-color: #4f46e5; padding: 30px; text-align: center;'>" +
                "      <h1 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;'>Hostel PMS</h1>" +
                "      <p style='color: #e0e7ff; margin: 5px 0 0; font-size: 14px;'>Student Accommodation System</p>" +
                "    </div>" +
                "    <div style='padding: 30px; color: #374151; line-height: 1.6;'>" +
                "      <h2 style='color: #1f2937; margin-top: 0; font-size: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;'>" + title + "</h2>" +
                "      <div style='font-size: 16px;'>" + content + "</div>" +
                "    </div>" +
                "    <div style='background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;'>" +
                "      <p style='margin: 0; color: #6b7280; font-size: 12px;'>&copy; 2025 Hostel Management System. All rights reserved.</p>" +
                "      <p style='margin: 5px 0 0; color: #9ca3af; font-size: 11px;'>This is an automated email. Please do not reply.</p>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }
}
