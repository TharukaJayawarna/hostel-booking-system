package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.request.AvailableBedDTO;
import com.hostel.hostel_backend.controller.request.CreateReservationRequestDTO;
import com.hostel.hostel_backend.controller.request.DateChangeRequestDTO;
import com.hostel.hostel_backend.controller.response.PayHereInitResponseDTO;
import com.hostel.hostel_backend.controller.response.ReservationListResponseDTO;
import com.hostel.hostel_backend.service.impl.ReservationServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReservationController {

    private final ReservationServiceImpl reservationService;

    @PostMapping("/initiate")
    public ResponseEntity<?> initiateReservation(@RequestBody CreateReservationRequestDTO dto) {
        try {
            PayHereInitResponseDTO response = reservationService.initiateReservation(dto);
            return ResponseEntity.ok(response);
        } catch (ObjectOptimisticLockingFailureException e) {
            return ResponseEntity.badRequest().body("Selected bed was just booked by someone else. Please try another.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 1. Reactivate Button එක Click කළාම
    // URL: POST http://localhost:8080/reservations/{id}/reactivate
    @PostMapping("/{id}/reactivate")
    public ResponseEntity<String> reactivateReservation(@PathVariable Long id) {
        try {
            reservationService.reactivateReservation(id);
            return ResponseEntity.ok("Success: Reservation reactivated and email sent.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed: " + e.getMessage());
        }
    }

    // 2. Assign New Bed Button එක Click කළාම (අලුත් Bed ID එකත් එක්ක)
    // URL: POST http://localhost:8080/reservations/{id}/assign/{newBedId}
    @PostMapping("/{id}/assign/{newBedId}")
    public ResponseEntity<String> assignNewBed(@PathVariable Long id, @PathVariable Long newBedId) {
        try {
            reservationService.assignNewBed(id, newBedId);
            return ResponseEntity.ok("Success: New bed assigned and email sent.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed: " + e.getMessage());
        }
    }

    //Get All Reservations
    @GetMapping
    public ResponseEntity<List<ReservationListResponseDTO>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    //Cancel Reservation (Student)
    @PatchMapping("/{reservation-id}/cancel")
    public ResponseEntity<String> cancelReservation(@PathVariable("reservation-id") Long reservationId) {
        try {
            reservationService.cancelReservationByStudent(reservationId);
            return ResponseEntity.ok("Reservation cancelled successfully. (No Refund)");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //Change Dates (Student)
    @PatchMapping("/{reservation-id}/change-dates")
    public ResponseEntity<String> updateDates(@PathVariable("reservation-id") Long reservationId, @RequestBody DateChangeRequestDTO dto) {
        try {
            reservationService.updateReservationDates(reservationId, dto);
            return ResponseEntity.ok("Dates updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/matching-beds")
    public ResponseEntity<List<AvailableBedDTO>> getMatchingBeds(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getMatchingBedsForRes(id));
    }
}