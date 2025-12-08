package com.hostel.hostel_backend.repository;

import com.hostel.hostel_backend.model.ReservationPeriod;
import com.hostel.hostel_backend.model.ReservationStatus;
import com.hostel.hostel_backend.model.ReservedFor;
import com.hostel.hostel_backend.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByIsPrivate(Boolean isPrivate);
    List<Room> findByReservationPeriod(ReservationPeriod reservationPeriod);
    List<Room> findByReservedFor(ReservedFor reservedFor);
    List<Room> findByIsPrivateFalse();
    List<Room> findByFloorIdAndIsPrivateFalse(Long floorId);
    List<Room> findByFloorId(Long floorId);
    @Query("SELECT DISTINCT r FROM Room r " +
            "JOIN r.floor f " +
            "JOIN r.beds b " +
            "WHERE f.hub.id = :hubId " +
            "AND b.underMaintenance = false " +
            "AND b.id NOT IN (" +
            "    SELECT res.bed.id FROM Reservation res " +
            "    WHERE res.reservationStatus IN :statuses " +
            "    AND ((:checkIn < res.toDate) AND (:checkOut > res.fromDate))" +
            ")")
    List<Room> findAvailableRooms(@Param("hubId") Long hubId,
                                  @Param("checkIn") LocalDate checkIn,
                                  @Param("checkOut") LocalDate checkOut,
                                  @Param("statuses") List<ReservationStatus> statuses);

}
