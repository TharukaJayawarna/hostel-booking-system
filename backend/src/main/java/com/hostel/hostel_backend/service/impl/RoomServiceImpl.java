package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.request.CreateRoomRequestDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.Floor;
import com.hostel.hostel_backend.model.ReservationPeriod;
import com.hostel.hostel_backend.model.ReservedFor;
import com.hostel.hostel_backend.model.Room;
import com.hostel.hostel_backend.repository.FloorRepository;
import com.hostel.hostel_backend.repository.RoomRepository;
import com.hostel.hostel_backend.service.RoomService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class RoomServiceImpl implements RoomService {
    private final FloorRepository floorRepository;
    private final RoomRepository roomRepository;

    @Override
    public void createRoom(Long floorId, CreateRoomRequestDTO dto) throws ResourceNotFoundException {
        Floor floor = floorRepository.findById(floorId).orElseThrow(() -> new ResourceNotFoundException("Floor with id " + floorId + " not found"));
        Room room = new Room();
        room.setFloor(floor);
        room.setRoomNumber(dto.getRoomNumber());
        room.setIsPrivate(dto.getIsPrivate());
        room.setPrice(dto.getPrice());
        room.setReservationPeriod(dto.getReservationPeriod());
        room.setReservedFor(dto.getReservedFor());
        roomRepository.save(room);
        if (floor.getRooms() == null) {
            floor.setRooms(new ArrayList<>());
        }

        floor.getRooms().add(room);
        floorRepository.save(floor);
    }

    @Override
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    @Override
    public List<Room> getPublicRooms() {
        return roomRepository.findByIsPrivateFalse();
    }

    @Override
    public List<Room> getPublicRoomsByFloor(Long floorId) {
        return roomRepository.findByFloorIdAndIsPrivateFalse(floorId);
    }

    @Override
    public List<Room> getAllRoomsByFloor(Long floorId) {
        return roomRepository.findByFloorId(floorId);
    }

    @Override
    public Room getRoomById(Long roomId) throws ResourceNotFoundException {
        return roomRepository.findById(roomId).orElseThrow(() -> new ResourceNotFoundException("Room with id " + roomId + " not found"));
    }

    @Override
    public void deleteRoom(Long roomId) throws ResourceNotFoundException {
        if (roomRepository.findById(roomId).isPresent()) {
            roomRepository.deleteById(roomId);
        }else {
            throw new ResourceNotFoundException("Room with id " + roomId + " not found");
        }
    }

    @Override
    public void updateReservedFor(Long roomId, ReservedFor reservedFor) throws ResourceNotFoundException {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new ResourceNotFoundException("Room with id " + roomId + " not found"));
        room.setReservedFor(reservedFor);
        roomRepository.save(room);
    }

    @Override
    public void updateIsPrivate(Long roomId, Boolean isPrivate) throws ResourceNotFoundException {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new ResourceNotFoundException("Room with id " + roomId + " not found"));
        room.setIsPrivate(isPrivate);
        roomRepository.save(room);
    }

    @Override
    public void updateReservationPeriod(Long roomId, ReservationPeriod reservationPeriod) throws ResourceNotFoundException {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new ResourceNotFoundException("Room with id " + roomId + " not found"));
        room.setReservationPeriod(reservationPeriod);
        roomRepository.save(room);
    }

    @Override
    public List<Room> getRoomsByPrivacy(Boolean isPrivate) {
        return roomRepository.findByIsPrivate(isPrivate);
    }

    @Override
    public List<Room> getRoomsByReservationPeriod(ReservationPeriod reservationPeriod) {
        return roomRepository.findByReservationPeriod(reservationPeriod);
    }

    @Override
    public List<Room> getRoomsByReservedFor(ReservedFor reservedFor) {
        return roomRepository.findByReservedFor(reservedFor);
    }
}
