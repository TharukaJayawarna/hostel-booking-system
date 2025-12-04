package com.hostel.hostel_backend.controller.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DateChangeRequestDTO {
    private LocalDate newCheckInDate;
    private LocalDate newCheckOutDate;
}
