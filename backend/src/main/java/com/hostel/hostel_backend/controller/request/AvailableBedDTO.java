package com.hostel.hostel_backend.controller.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AvailableBedDTO {
    private Long id;
    private String bedNumber;
    private Double price;
}
