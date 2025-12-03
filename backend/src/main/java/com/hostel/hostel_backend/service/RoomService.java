package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.controller.request.CreateRoomRequestDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.ReservationPeriod;
import com.hostel.hostel_backend.model.ReservedFor;
import com.hostel.hostel_backend.model.Room;

import java.util.List;

public interface RoomService {
    void createRoom(Long floorId, CreateRoomRequestDTO dto) throws ResourceNotFoundException;
    List<Room> getAllRooms();
    List<Room> getPublicRooms();
    List<Room> getPublicRoomsByFloor(Long floorId);
    List<Room> getAllRoomsByFloor(Long floorId);
    Room getRoomById(Long roomId) throws ResourceNotFoundException;
    void deleteRoom(Long roomId) throws ResourceNotFoundException;
    void updateReservedFor(Long roomId, ReservedFor reservedFor) throws ResourceNotFoundException;
    void updateIsPrivate(Long roomId, Boolean isPrivate) throws ResourceNotFoundException;
    void updateReservationPeriod(Long roomId, ReservationPeriod reservationPeriod) throws ResourceNotFoundException;
    List<Room> getRoomsByPrivacy(Boolean isPrivate);
    List<Room> getRoomsByReservationPeriod(ReservationPeriod reservationPeriod);
    List<Room> getRoomsByReservedFor(ReservedFor reservedFor);
}
