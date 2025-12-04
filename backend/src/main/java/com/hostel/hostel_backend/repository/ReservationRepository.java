package com.hostel.hostel_backend.repository;

import com.hostel.hostel_backend.model.Reservation;
import com.hostel.hostel_backend.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation,Long> {
    Optional<Reservation> findByReservationNumber(String reservationNumber);
    // Scheduler එකට අවශ්‍ය Query එක
    List<Reservation> findAllByReservationStatusAndCreatedDateBefore(
            ReservationStatus status,
            LocalDateTime dateTime
    );
}
