package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.controller.request.AvailableBedDTO;
import com.hostel.hostel_backend.controller.request.CreateReservationRequestDTO;
import com.hostel.hostel_backend.controller.request.DateChangeRequestDTO;
import com.hostel.hostel_backend.controller.response.PayHereInitResponseDTO;
import com.hostel.hostel_backend.controller.response.ReservationListResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.Reservation;

import java.time.LocalDate;
import java.util.List;

public interface ReservationService {
    PayHereInitResponseDTO initiateReservation(CreateReservationRequestDTO dto);
    void sendSuccessEmail(Reservation reservation);
    void sendFailureEmail(Reservation res);
    void reactivateReservation(Long reservationId);
    void assignNewBed(Long reservationId, Long newBedId);
    List<ReservationListResponseDTO> getAllActiveReservations();
    List<ReservationListResponseDTO> getTrashReservations();
    List<AvailableBedDTO> getMatchingBedsForRes(Long reservationId);
    void cancelReservation(Long reservationId);
    void updateReservationDates(Long reservationId, DateChangeRequestDTO dto);
    Reservation getReservationById(Long id) throws ResourceNotFoundException;
    Double getEstimatedPrice(Long bedId, LocalDate checkIn, LocalDate checkOut);
}
