package com.hostel.hostel_backend.repository;

import com.hostel.hostel_backend.model.Bed;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BedRepository extends JpaRepository<Bed, Long> {
    List<Bed> findByIsBooked(Boolean isBooked);
    List<Bed> findByIsBookedFalseAndRoomMonthlyPrice(Double monthlyPrice);
    List<Bed> findByRoomId(Long roomId);
}
