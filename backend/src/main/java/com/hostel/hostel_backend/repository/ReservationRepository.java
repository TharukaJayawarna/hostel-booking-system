package com.hostel.hostel_backend.repository;

import com.hostel.hostel_backend.model.Reservation;
import com.hostel.hostel_backend.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation,Long> {
    Optional<Reservation> findByReservationNumber(String reservationNumber);
    //All Reservations (TRASH ඒවා හැර අනිත් ඔක්කොම)
    List<Reservation> findByReservationStatusNot(ReservationStatus status);

    //Trash Reservations Only (TRASH ඒවා විතරයි)
    List<Reservation> findByReservationStatus(ReservationStatus status);

    //Scheduler එකට (Checkout කර මාස 6ක් පරණ, හැබැයි තාම TRASH නොකරපු ඒවා)
    List<Reservation> findByToDateBeforeAndReservationStatusNot(LocalDate date, ReservationStatus status);

    // Scheduler එකට අවශ්‍ය Query එක
    List<Reservation> findAllByReservationStatusAndCreatedDateBefore(
            ReservationStatus status,
            LocalDateTime dateTime
    );

    List<Reservation> findByReservationStatusAndToDateBefore(ReservationStatus status, LocalDate date);

    List<Reservation> findByUserUsernameAndToDateGreaterThanEqual(String username, LocalDate date);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Reservation r " +
            "WHERE r.bed.id = :bedId " +
            "AND r.id != :reservationId " +
            "AND r.reservationStatus IN :statuses " +
            "AND ((:newCheckIn < r.toDate) AND (:newCheckOut > r.fromDate))")
    boolean existsOverlappingReservation(@Param("bedId") Long bedId,
                                         @Param("reservationId") Long reservationId,
                                         @Param("newCheckIn") LocalDate newCheckIn,
                                         @Param("newCheckOut") LocalDate newCheckOut,
                                         @Param("statuses") List<ReservationStatus> statuses);
}
