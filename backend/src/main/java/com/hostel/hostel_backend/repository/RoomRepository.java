package com.hostel.hostel_backend.repository;

import com.hostel.hostel_backend.model.ReservationPeriod;
import com.hostel.hostel_backend.model.ReservedFor;
import com.hostel.hostel_backend.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByIsPrivate(Boolean isPrivate);
    List<Room> findByReservationPeriod(ReservationPeriod reservationPeriod);
    List<Room> findByReservedFor(ReservedFor reservedFor);
    List<Room> findByIsPrivateFalse();
    List<Room> findByFloorIdAndIsPrivateFalse(Long floorId);
    List<Room> findByFloorId(Long floorId);
}
