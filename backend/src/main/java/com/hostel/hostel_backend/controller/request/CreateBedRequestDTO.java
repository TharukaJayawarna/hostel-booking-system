package com.hostel.hostel_backend.controller.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateBedRequestDTO {
    private String bedNumber;
    private Boolean isBooked = false;
}
