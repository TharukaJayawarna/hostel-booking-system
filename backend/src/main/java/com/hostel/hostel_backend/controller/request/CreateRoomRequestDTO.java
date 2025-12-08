package com.hostel.hostel_backend.controller.request;

import com.hostel.hostel_backend.model.ReservationPeriod;
import com.hostel.hostel_backend.model.ReservedFor;
import com.hostel.hostel_backend.model.RoomType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateRoomRequestDTO {
    private String roomNumber;
    private Boolean isPrivate;
    private Double price;
    private RoomType roomType;
    private ReservationPeriod reservationPeriod;
    private ReservedFor reservedFor;
}
