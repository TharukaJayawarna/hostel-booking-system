package com.hostel.hostel_backend.controller.request;

import com.hostel.hostel_backend.model.ReservationPeriod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateIssueRequestDTO {
    private String studentId;
    private String studentName;
    private String studentEmail;
    private String studentPhone;
    private ReservationPeriod duration;
    private LocalDate checkinDate;
    private LocalDate checkoutDate;
    private String bank;
    private LocalDate paymentDoneDate;
    private String comment;
}
