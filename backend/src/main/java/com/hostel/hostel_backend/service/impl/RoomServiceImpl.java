package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.request.CreateRoomRequestDTO;
import com.hostel.hostel_backend.controller.response.RoomResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.*;
import com.hostel.hostel_backend.repository.FloorRepository;
import com.hostel.hostel_backend.repository.RoomRepository;
import com.hostel.hostel_backend.service.RoomService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
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
        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() -> new ResourceNotFoundException("Floor with id " + floorId + " not found"));

        Room room = new Room();
        room.setFloor(floor);
        room.setRoomNumber(dto.getRoomNumber());
        room.setIsPrivate(dto.getIsPrivate());
        room.setPrice(dto.getPrice());
        room.setReservationPeriod(dto.getReservationPeriod());
        room.setReservedFor(dto.getReservedFor());
        room.setComment(null);

        // Room Type එක Set කරන්න (Default: 2 Sharing)
        RoomType type = dto.getRoomType() != null ? dto.getRoomType() : RoomType.SHARING_2;
        room.setRoomType(type);

        // කාමරය Save කරන්න
        roomRepository.save(room);

        // --- ස්වයංක්‍රීයව ඇඳන් සෑදීම (Auto-generate Beds) ---
        int capacity = type.getCapacity();
        List<Bed> bedList = new ArrayList<>();

        for (int i = 1; i <= capacity; i++) {
            Bed bed = new Bed();
            // Bed Number එක: R101-1, R101-2 වගේ හැදෙනවා
            bed.setBedNumber(dto.getRoomNumber() + "-" + i);
            bed.setIsBooked(false);
            bed.setUnderMaintenance(false);
            bed.setRoom(room);
            bedList.add(bed);
        }

        // ඇඳන් ටික කාමරයට දාලා Save කරන්න (Cascade Type ALL නිසා Beds ටිකත් Save වෙයි)
        room.setBeds(bedList);
        roomRepository.save(room); // Update with beds

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
                .roomType(room.getRoomType())
                .reservationPeriod(room.getReservationPeriod())
                .reservedFor(room.getReservedFor())
                .floorNumber(room.getFloor().getFloorNumber())
                .hubNumber(room.getFloor().getHub().getHubNumber())
                .comment(room.getComment())
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

    @Override
    public List<RoomResponseDTO> getAvailableRooms(Long hubId, LocalDate checkIn, LocalDate checkOut) {

        List<ReservationStatus> activeStatuses = Arrays.asList(
                ReservationStatus.COMPLETED,
                ReservationStatus.PENDING
        );

        return roomRepository.findAvailableRooms(hubId, checkIn, checkOut, activeStatuses).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateRoom(Long roomId, CreateRoomRequestDTO dto) throws ResourceNotFoundException {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id " + roomId));

        // Null check karamin data update kirima
        if (dto.getRoomNumber() != null) room.setRoomNumber(dto.getRoomNumber());
        if (dto.getPrice() != null) room.setPrice(dto.getPrice());
        if (dto.getIsPrivate() != null) room.setIsPrivate(dto.getIsPrivate());
        if (dto.getRoomType() != null) room.setRoomType(dto.getRoomType());
        if (dto.getReservationPeriod() != null) room.setReservationPeriod(dto.getReservationPeriod());
        if (dto.getReservedFor() != null) room.setReservedFor(dto.getReservedFor());
        if (dto.getComment() != null) {
            room.setComment(dto.getComment());
        }

        roomRepository.save(room);
    }
}
