package com.hostel.hostel_backend.controller.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HubResponseDTO {
    private Long id;
    private String hubNumber;
    private int noOfFloors;
    private int noOfRooms;
    private String image;
    private String description;
}
