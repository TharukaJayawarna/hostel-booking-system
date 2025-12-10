package com.hostel.hostel_backend.controller.response;

import com.hostel.hostel_backend.model.PaymentStatus;
import com.hostel.hostel_backend.model.ReservationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class ReservationListResponseDTO {
    private Long id;
    private String reservationNumber;
    private String studentName;
    private String studentRegNo;
    private String bedNumber;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private ReservationStatus status;
    private String paymentId;
    private LocalDate paymentDate;
    private LocalTime paymentTime;
}
