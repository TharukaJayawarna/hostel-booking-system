package com.hostel.hostel_backend.controller.response;

import com.hostel.hostel_backend.model.Gender;
import com.hostel.hostel_backend.model.ReservationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class ReservationDetailResponseDTO {
    private Long id;
    private String reservationNumber;
    private String studentName;
    private String studentEmail;
    private String studentContact;
    private Gender gender;
    private String bedNumber;
    private String roomNumber;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private ReservationStatus status;
    private Double amountPaid; // Payment එකෙන් ගන්න පුළුවන්
}