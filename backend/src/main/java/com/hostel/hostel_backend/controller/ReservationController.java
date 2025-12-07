package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.request.AvailableBedDTO;
import com.hostel.hostel_backend.controller.request.CreateReservationRequestDTO;
import com.hostel.hostel_backend.controller.request.DateChangeRequestDTO;
import com.hostel.hostel_backend.controller.response.ApiResponse;
import com.hostel.hostel_backend.controller.response.PayHereInitResponseDTO;
import com.hostel.hostel_backend.controller.response.ReservationDetailResponseDTO;
import com.hostel.hostel_backend.controller.response.ReservationListResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.service.impl.ReservationServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReservationController {

    private final ReservationServiceImpl reservationService;

    // 1. Initiate Reservation (Payment Start)
    @PostMapping(value = "/initiate", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<PayHereInitResponseDTO>> initiateReservation(@RequestBody CreateReservationRequestDTO dto) {
        // Exception Handling is done automatically by GlobalExceptionHandler
        PayHereInitResponseDTO response = reservationService.initiateReservation(dto);
        return ResponseEntity.ok(ApiResponse.success("Reservation initiated successfully", response));
    }

    // 2. Reactivate Reservation (Admin Feature)
    @PostMapping(value = "/{reservation-id}/reactivate", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<Void>> reactivateReservation(@PathVariable("reservation-id") Long reservationId) throws ResourceNotFoundException {
        reservationService.reactivateReservation(reservationId);
        return ResponseEntity.ok(ApiResponse.success("Success: Reservation reactivated and email sent."));
    }

    // 3. Assign New Bed (Admin Feature)
    @PostMapping(value = "/{reservation-id}/assign/{new-bed-id}", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<Void>> assignNewBed(
            @PathVariable("reservation-id") Long reservationId,
            @PathVariable("new-bed-id") Long newBedId
    ) throws ResourceNotFoundException {
        reservationService.assignNewBed(reservationId, newBedId);
        return ResponseEntity.ok(ApiResponse.success("Success: New bed assigned and email sent."));
    }

    // 4. Get All Active Reservations
    @GetMapping(headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<List<ReservationListResponseDTO>>> getAllActiveReservations() {
        return ResponseEntity.ok(ApiResponse.success("Active reservations fetched", reservationService.getAllActiveReservations()));
    }

    // 5. Get Trash Reservations
    @GetMapping(value = "/trash", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<List<ReservationListResponseDTO>>> getTrashReservations() {
        return ResponseEntity.ok(ApiResponse.success("Trash reservations fetched", reservationService.getTrashReservations()));
    }

    // 6. Get Single Reservation By ID
    @GetMapping(value = "/{reservation-id}", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<ReservationDetailResponseDTO>> getReservationById(@PathVariable("reservation-id") Long reservationId) throws ResourceNotFoundException {
        return ResponseEntity.ok(ApiResponse.success("Reservation details fetched", reservationService.getReservationById(reservationId)));
    }

    // 7. Cancel Reservation (Student Feature)
    @PatchMapping(value = "/{reservation-id}/cancel", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<Void>> cancelReservation(@PathVariable("reservation-id") Long reservationId) throws ResourceNotFoundException {
        reservationService.cancelReservation(reservationId);
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled successfully. (No Refund policy applied)"));
    }

    // 8. Update Reservation Dates (Student Feature)
    @PatchMapping(value = "/{reservation-id}/change-dates", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<Void>> updateDates(
            @PathVariable("reservation-id") Long reservationId,
            @RequestBody DateChangeRequestDTO dto
    ) throws ResourceNotFoundException {
        reservationService.updateReservationDates(reservationId, dto);
        return ResponseEntity.ok(ApiResponse.success("Dates updated successfully."));
    }

    // 9. Get Matching Beds for Re-assignment (Admin Feature)
    @GetMapping(value = "/{reservation-id}/matching-beds", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<List<AvailableBedDTO>>> getMatchingBeds(@PathVariable("reservation-id") Long reservationId) throws ResourceNotFoundException {
        return ResponseEntity.ok(ApiResponse.success("Matching beds fetched", reservationService.getMatchingBedsForRes(reservationId)));
    }

    // 10. Calculate Price (For Frontend Display)
    @GetMapping(value = "/calculate", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<Double>> calculateAmount(
            @RequestParam Long bedId,
            @RequestParam LocalDate fromDate,
            @RequestParam LocalDate toDate
    ) throws ResourceNotFoundException {
        Double amount = reservationService.getEstimatedPrice(bedId, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Price calculated successfully", amount));
    }
}