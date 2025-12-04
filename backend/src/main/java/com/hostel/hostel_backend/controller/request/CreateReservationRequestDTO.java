package com.hostel.hostel_backend.controller.request;

import com.hostel.hostel_backend.model.Gender;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateReservationRequestDTO {
    private String studentName;
    private String registrationNumber;
    private String email;
    private String contactNumber;
    private String address;
    private Gender gender;

    private Long bedId;
    private LocalDate fromDate;
    private LocalDate toDate;

    private Double amount;
}