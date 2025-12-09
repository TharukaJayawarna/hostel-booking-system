package com.hostel.hostel_backend.controller.response;

import com.hostel.hostel_backend.model.Gender;
import com.hostel.hostel_backend.model.PaymentStatus;
import com.hostel.hostel_backend.model.ReservationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class ReservationDetailResponseDTO {
    private Long id;
    private String reservationNumber;
    private String studentName;
    private String studentEmail;
    private String studentRegistrationNumber;
    private String studentContact;
    private Gender gender;
    private String bedNumber;
    private String roomNumber;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private ReservationStatus status;
    private Double amountPaid;
    private String paymentId;
    private LocalDate paymentDate;
    private LocalTime paymentTime;
    private PaymentStatus paymentStatus;
}