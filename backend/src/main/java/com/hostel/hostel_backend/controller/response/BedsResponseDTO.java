package com.hostel.hostel_backend.controller.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BedsResponseDTO {
    private Long id;
    private String bedNumber;
    private Boolean isBooked;
    private String roomNumber;
}
