package com.hostel.hostel_backend.controller.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FloorResponseDTO {
    private Long id;
    private String floorNumber;
    private String hubNumber;
    private int noOfRooms;
}
