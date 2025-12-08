package com.hostel.hostel_backend.controller.response;

import com.hostel.hostel_backend.model.ReservationPeriod;
import com.hostel.hostel_backend.model.ReservedFor;
import com.hostel.hostel_backend.model.RoomType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoomResponseDTO {
    private Long id;
    private String roomNumber;
    private Boolean isPrivate;
    private Double price;
    private ReservationPeriod reservationPeriod;
    private RoomType roomType;
    private ReservedFor reservedFor;
    private String floorNumber;
    private String hubNumber;
}