package com.hostel.hostel_backend.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IssueDTO {
    private String studentId;
    private String studentName;
    private String studentEmail;
    private String studentPhone;
    private String duration;
    private LocalDate checkinDate;
    private LocalDate checkoutDate;
    private String bank;
    private LocalDate paymentDoneDate;
    private String cardLastFour;
    private String comment;
}
