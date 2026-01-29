package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.response.ReservationDetailResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.*;
import com.hostel.hostel_backend.repository.BedRepository;
import com.hostel.hostel_backend.repository.PaymentRepository;
import com.hostel.hostel_backend.repository.ReservationRepository;
import com.hostel.hostel_backend.service.EmailProducer;
import com.hostel.hostel_backend.service.EmailService;
import com.hostel.hostel_backend.service.PaymentService;
import com.hostel.hostel_backend.util.PayHereUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final BedRepository bedRepository;
    private final PayHereUtil payHereUtil;
    private final EmailProducer emailProducer;
    private final ReservationServiceImpl reservationService;
    private final NotificationServiceImpl notificationService;
    private final EmailService emailService;

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

        log.info("Received PayHere notification | Order ID: {}", orderId);

        String localHash = payHereUtil.generateNotifyHash(
                merchantId,
                orderId,
                Double.parseDouble(payhereAmount),
                payhereCurrency,
                statusCode,
                merchantSecret
        );

        if (!localHash.equals(md5sig)) {
            log.error("Hash mismatch | Order ID: {} | PayHere: {} | Local: {}",
                    orderId, md5sig, localHash);
            return "FAILED";
        }

        Optional<Payment> paymentOpt = paymentRepository.findByPaymentId(orderId);
        if (paymentOpt.isEmpty()) {
            log.warn("Payment not found | Order ID: {}", orderId);
            return "FAILED";
        }

        Payment payment = paymentOpt.get();

        Double receivedAmount = Double.parseDouble(payhereAmount);
        if (payment.getPaymentAmount() != null &&
                !payment.getPaymentAmount().equals(receivedAmount)) {

            log.error("Amount mismatch | Order ID: {} | Expected: {} | Received: {}",
                    orderId, payment.getPaymentAmount(), receivedAmount);
            return "FAILED";
        }

        Reservation reservation = payment.getReservation();

        if ("2".equals(statusCode)) {
            log.info("Payment SUCCESS | Order ID: {}", orderId);
            return handleSuccess(payment, reservation, payhereAmount, orderId);
        } else if ("-1".equals(statusCode) || "-2".equals(statusCode)) {
            log.warn("Payment FAILED | Order ID: {} | Status Code: {}", orderId, statusCode);
            return handleFailure(payment, reservation);
        }

        log.info("Unhandled payment status | Order ID: {} | Status Code: {}", orderId, statusCode);
        return "OK";
    }

    private String handleSuccess(Payment payment, Reservation reservation,
                                 String payhereAmount, String orderId) {

        if (reservation != null &&
                reservation.getReservationStatus() == ReservationStatus.REJECTED) {

            log.warn("Late payment received for REJECTED reservation | Order ID: {}", orderId);

            payment.setPaymentStatus(PaymentStatus.APPROVED);
            paymentRepository.save(payment);

            Bed bed = reservation.getBed();
            if (bed != null && !Boolean.TRUE.equals(bed.getIsBooked())) {
                bed.setIsBooked(true);
                bedRepository.save(bed);

                reservation.setReservationStatus(ReservationStatus.APPROVED);
                reservationRepository.save(reservation);

                reservationService.sendSuccessEmail(reservation);

                log.info("Reservation AUTO-RECOVERED from Late Payment | Order ID: {}", orderId);
                return "OK";
            }

            // 1. Admin Email (Late Payment)
            Map<String, Object> adminVars = new HashMap<>();
            adminVars.put("orderId", orderId);
            adminVars.put("amount", payhereAmount);
            adminVars.put("studentName", reservation.getStudentName());
            adminVars.put("regNo", reservation.getStudentRegistrationNumber());

            String adminBody = emailService.getHtmlContent("admin-late-payment", adminVars);
            emailProducer.sendEmail(ADMIN_EMAIL, "URGENT: Late Payment Received - " + orderId, adminBody);

            // 2. Student Notification
            if (reservation.getUser() != null) {
                Map<String, Object> studentVars = new HashMap<>();
                studentVars.put("studentName", reservation.getStudentName());
                studentVars.put("amount", payhereAmount);

                String studentContent = emailService.getHtmlContent("student-late-payment-notification", studentVars);
                notificationService.createNotification(
                        reservation.getUser(),
                        "Payment Received - Booking Issue",
                        studentContent
                );
            }

            return "OK";
        }

        payment.setPaymentStatus(PaymentStatus.APPROVED);

        if (reservation != null) {
            reservation.setReservationStatus(ReservationStatus.APPROVED);
            reservationRepository.save(reservation);
            reservationService.sendSuccessEmail(reservation);
        }

        paymentRepository.save(payment);
        log.info("Reservation & payment approved | Order ID: {}", orderId);
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
                log.info("Bed released | Bed ID: {}", bed.getId());
            }

            reservationRepository.save(reservation);
            reservationService.sendFailureEmail(reservation);
        }

        paymentRepository.save(payment);
        log.warn("Payment marked as REJECTED | Order ID: {}", payment.getPaymentId());
        return "OK";
    }

    @Override
    public ReservationDetailResponseDTO verifyPayment(String orderId)
            throws ResourceNotFoundException {

        Reservation reservation = reservationRepository
                .findByReservationNumber(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Reservation not found for Order ID: " + orderId
                        )
                );

        log.info("Payment verification requested | Order ID: {}", orderId);

        return ReservationDetailResponseDTO.builder()
                .id(reservation.getId())
                .reservationNumber(reservation.getReservationNumber())
                .status(reservation.getReservationStatus())
                .paymentStatus(
                        reservation.getPayment() != null
                                ? reservation.getPayment().getPaymentStatus()
                                : null
                )
                .studentName(reservation.getStudentName())
                .studentEmail(reservation.getStudentEmail())
                .build();
    }
}