package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.controller.request.CreateRoomRequestDTO;
import com.hostel.hostel_backend.controller.response.RoomResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.ReservationPeriod;
import com.hostel.hostel_backend.model.ReservedFor;

import java.time.LocalDate;
import java.util.List;

public interface RoomService {
    void createRoom(Long floorId, CreateRoomRequestDTO dto) throws ResourceNotFoundException;
    List<RoomResponseDTO> getAllRooms();
    List<RoomResponseDTO> getPublicRooms();
    List<RoomResponseDTO> getPublicRoomsByFloor(Long floorId);
    List<RoomResponseDTO> getAllRoomsByFloor(Long floorId);
    RoomResponseDTO getRoomById(Long roomId) throws ResourceNotFoundException;
    void deleteRoom(Long roomId) throws ResourceNotFoundException;
    void updateReservedFor(Long roomId, ReservedFor reservedFor) throws ResourceNotFoundException;
    void updateIsPrivate(Long roomId, Boolean isPrivate) throws ResourceNotFoundException;
    void updateReservationPeriod(Long roomId, ReservationPeriod reservationPeriod) throws ResourceNotFoundException;
    List<RoomResponseDTO> getRoomsByPrivacy(Boolean isPrivate);
    List<RoomResponseDTO> getRoomsByReservationPeriod(ReservationPeriod reservationPeriod);
    List<RoomResponseDTO> getRoomsByReservedFor(ReservedFor reservedFor);
    List<RoomResponseDTO> getAvailableRooms(Long hubId, LocalDate checkIn, LocalDate checkOut);
}
