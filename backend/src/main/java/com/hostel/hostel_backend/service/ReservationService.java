package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.controller.request.AvailableBedDTO;
import com.hostel.hostel_backend.controller.request.CreateReservationRequestDTO;
import com.hostel.hostel_backend.controller.request.DateChangeRequestDTO;
import com.hostel.hostel_backend.controller.response.PayHereInitResponseDTO;
import com.hostel.hostel_backend.controller.response.ReservationListResponseDTO;
import com.hostel.hostel_backend.model.Reservation;

import java.util.List;

public interface ReservationService {
    PayHereInitResponseDTO initiateReservation(CreateReservationRequestDTO dto);
    void sendSuccessEmail(Reservation reservation);
    void sendFailureEmail(Reservation res);
    void reactivateReservation(Long reservationId);
    void assignNewBed(Long reservationId, Long newBedId);
    List<ReservationListResponseDTO> getAllReservations();
    List<AvailableBedDTO> getMatchingBedsForRes(Long reservationId);
    void cancelReservationByStudent(Long reservationId);
    void updateReservationDates(Long reservationId, DateChangeRequestDTO dto);
}
