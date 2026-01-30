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
    List<Reservation> findByReservationStatusNot(ReservationStatus status);

    //Trash Reservations Only
    List<Reservation> findByReservationStatus(ReservationStatus status);

    List<Reservation> findByToDateBeforeAndReservationStatusNot(LocalDate date, ReservationStatus status);

    List<Reservation> findAllByReservationStatusAndCreatedDateBefore(
            ReservationStatus status,
            LocalDateTime dateTime
    );

    List<Reservation> findByReservationStatusAndToDateBefore(ReservationStatus status, LocalDate date);

    List<Reservation> findByUserUsernameAndToDateGreaterThanEqual(String username, LocalDate date);

    @Query("SELECT r.bed.id FROM Reservation r " +
            "WHERE r.bed.room.id = :roomId " +
            "AND r.reservationStatus IN :statuses " +
            "AND ((:checkIn < r.toDate) AND (:checkOut > r.fromDate))")
    List<Long> findOccupiedBedIds(@Param("roomId") Long roomId,
                                  @Param("checkIn") LocalDate checkIn,
                                  @Param("checkOut") LocalDate checkOut,
                                  @Param("statuses") List<ReservationStatus> statuses);

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

    @Query("SELECT r FROM Reservation r " +
            "WHERE r.reservationStatus IN :statuses " +
            "AND (r.fromDate < :blockEnd AND r.toDate > :blockStart)")
    List<Reservation> findOverlappingReservationsForAdmin(
            @Param("blockStart") LocalDate blockStart,
            @Param("blockEnd") LocalDate blockEnd,
            @Param("statuses") List<ReservationStatus> statuses
    );
}
