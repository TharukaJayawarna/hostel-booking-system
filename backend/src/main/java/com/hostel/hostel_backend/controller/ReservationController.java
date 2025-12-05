package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.request.AvailableBedDTO;
import com.hostel.hostel_backend.controller.request.CreateReservationRequestDTO;
import com.hostel.hostel_backend.controller.request.DateChangeRequestDTO;
import com.hostel.hostel_backend.controller.response.PayHereInitResponseDTO;
import com.hostel.hostel_backend.controller.response.ReservationDetailResponseDTO;
import com.hostel.hostel_backend.controller.response.ReservationListResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.service.impl.ReservationServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReservationController {

    private final ReservationServiceImpl reservationService;

    @PostMapping(value = "/initiate", headers = "X-Api-Version=v1")
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

    //Reactivate Button එක Click කළාම
    @PostMapping(value = "/{reservation-id}/reactivate", headers = "X-Api-Version=v1")
    public ResponseEntity<String> reactivateReservation(@PathVariable("reservation-id") Long reservationId) {
        try {
            reservationService.reactivateReservation(reservationId);
            return ResponseEntity.ok("Success: Reservation reactivated and email sent.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed: " + e.getMessage());
        }
    }

    //Assign New Bed Button එක Click කළාම (අලුත් Bed ID එකත් එක්ක)
    @PostMapping(value = "/{reservation-id}/assign/{new-bed-id}", headers = "X-Api-Version=v1")
    public ResponseEntity<String> assignNewBed(@PathVariable("reservation-id") Long reservationId, @PathVariable("new-bed-id") Long newBedId) {
        try {
            reservationService.assignNewBed(reservationId, newBedId);
            return ResponseEntity.ok("Success: New bed assigned and email sent.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed: " + e.getMessage());
        }
    }

    //Get All Active Reservations (TRASH නැති ඒවා)
    @GetMapping(headers = "X-Api-Version=v1")
    public ResponseEntity<List<ReservationListResponseDTO>> getAllActiveReservations() {
        return ResponseEntity.ok(reservationService.getAllActiveReservations());
    }

    //Get Trash Reservations (TRASH ඒවා විතරයි)
    @GetMapping(value = "/trash",headers = "X-Api-Version=v1")
    public ResponseEntity<List<ReservationListResponseDTO>> getTrashReservations() {
        return ResponseEntity.ok(reservationService.getTrashReservations());
    }

    //Get Reservation By ID
    @GetMapping(value = "/{reservation-id}",headers = "X-Api-Version=v1")
    public ResponseEntity<ReservationDetailResponseDTO> getReservationById(@PathVariable("reservation-id") Long reservationId) throws ResourceNotFoundException {
        return ResponseEntity.ok(reservationService.getReservationById(reservationId));
    }

    //Cancel Reservation
    @PatchMapping(value = "/{reservation-id}/cancel",headers = "X-Api-Version=v1")
    public ResponseEntity<String> cancelReservation(@PathVariable("reservation-id") Long reservationId) {
        try {
            reservationService.cancelReservation(reservationId);
            return ResponseEntity.ok("Reservation cancelled successfully. (No Refund)");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //Change Dates
    @PatchMapping(value = "/{reservation-id}/change-dates",headers = "X-Api-Version=v1")
    public ResponseEntity<String> updateDates(@PathVariable("reservation-id") Long reservationId, @RequestBody DateChangeRequestDTO dto) {
        try {
            reservationService.updateReservationDates(reservationId, dto);
            return ResponseEntity.ok("Dates updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping(value = "/{reservation-id}/matching-beds",headers = "X-Api-Version=v1")
    public ResponseEntity<List<AvailableBedDTO>> getMatchingBeds(@PathVariable("reservation-id") Long reservationId) throws ResourceNotFoundException {
        return ResponseEntity.ok(reservationService.getMatchingBedsForRes(reservationId));
    }

    // ළමයාට ගාණ බලාගන්න API එක
    // URL: GET /reservations/calculate?bedId=1&fromDate=2024-05-01&toDate=2024-06-01
    @GetMapping(value = "/calculate",headers = "X-Api-Version=v1")
    public ResponseEntity<Double> calculateAmount(
            @RequestParam Long bedId,
            @RequestParam LocalDate fromDate,
            @RequestParam LocalDate toDate
    ) throws ResourceNotFoundException {
        return ResponseEntity.ok(reservationService.getEstimatedPrice(bedId, fromDate, toDate));
    }
}