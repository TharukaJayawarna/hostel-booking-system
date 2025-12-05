package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.request.CreateRoomRequestDTO;
import com.hostel.hostel_backend.controller.response.RoomResponseDTO;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional(readOnly = true)
public class RoomServiceImpl implements RoomService {
    private final FloorRepository floorRepository;
    private final RoomRepository roomRepository;

    @Override
    @Transactional
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
    public List<RoomResponseDTO> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private RoomResponseDTO mapToDTO(Room room) {
        return RoomResponseDTO.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .isPrivate(room.getIsPrivate())
                .price(room.getPrice())
                .reservationPeriod(room.getReservationPeriod())
                .reservedFor(room.getReservedFor())
                .floorNumber(room.getFloor().getFloorNumber())
                .hubNumber(room.getFloor().getHub().getHubNumber())
                .build();
    }

    @Override
    public List<RoomResponseDTO> getPublicRooms() {
        return roomRepository.findByIsPrivateFalse().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomResponseDTO> getPublicRoomsByFloor(Long floorId) {
        return roomRepository.findByFloorIdAndIsPrivateFalse(floorId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomResponseDTO> getAllRoomsByFloor(Long floorId) {
        return roomRepository.findByFloorId(floorId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RoomResponseDTO getRoomById(Long roomId) throws ResourceNotFoundException {
        return roomRepository.findById(roomId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Room with id " + roomId + " not found"));
    }

    @Override
    @Transactional
    public void deleteRoom(Long roomId) throws ResourceNotFoundException {
        if (roomRepository.findById(roomId).isPresent()) {
            roomRepository.deleteById(roomId);
        }else {
            throw new ResourceNotFoundException("Room with id " + roomId + " not found");
        }
    }

    @Override
    @Transactional
    public void updateReservedFor(Long roomId, ReservedFor reservedFor) throws ResourceNotFoundException {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new ResourceNotFoundException("Room with id " + roomId + " not found"));
        room.setReservedFor(reservedFor);
        roomRepository.save(room);
    }

    @Override
    @Transactional
    public void updateIsPrivate(Long roomId, Boolean isPrivate) throws ResourceNotFoundException {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new ResourceNotFoundException("Room with id " + roomId + " not found"));
        room.setIsPrivate(isPrivate);
        roomRepository.save(room);
    }

    @Override
    @Transactional
    public void updateReservationPeriod(Long roomId, ReservationPeriod reservationPeriod) throws ResourceNotFoundException {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new ResourceNotFoundException("Room with id " + roomId + " not found"));
        room.setReservationPeriod(reservationPeriod);
        roomRepository.save(room);
    }

    @Override
    public List<RoomResponseDTO> getRoomsByPrivacy(Boolean isPrivate) {
        return roomRepository.findByIsPrivate(isPrivate).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomResponseDTO> getRoomsByReservationPeriod(ReservationPeriod reservationPeriod) {
        return roomRepository.findByReservationPeriod(reservationPeriod).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomResponseDTO> getRoomsByReservedFor(ReservedFor reservedFor) {
        return roomRepository.findByReservedFor(reservedFor).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
}
