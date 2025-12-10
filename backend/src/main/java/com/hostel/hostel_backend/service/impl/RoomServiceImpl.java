package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.request.CreateRoomRequestDTO;
import com.hostel.hostel_backend.controller.response.RoomResponseDTO;
import com.hostel.hostel_backend.exception.AppException;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.*;
import com.hostel.hostel_backend.repository.BedRepository;
import com.hostel.hostel_backend.repository.FloorRepository;
import com.hostel.hostel_backend.repository.RoomRepository;
import com.hostel.hostel_backend.service.RoomService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional(readOnly = true)
public class RoomServiceImpl implements RoomService {
    private final FloorRepository floorRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository; // BedRepository එකතු කරන ලදී

    @Override
    @Transactional
    public void createRoom(Long floorId, CreateRoomRequestDTO dto) throws ResourceNotFoundException {
        Floor floor = floorRepository.findById(floorId)
                .orElseThrow(() -> new ResourceNotFoundException("Floor with id " + floorId + " not found"));

        Room room = new Room();
        room.setFloor(floor);
        room.setRoomNumber(dto.getRoomNumber());
        room.setIsPrivate(dto.getIsPrivate());
        room.setMonthlyPrice(dto.getMonthlyPrice());

        if (dto.getReservationPeriod() == ReservationPeriod.DEFAULT) {
            room.setWeeklyPrice(dto.getWeeklyPrice());
            room.setDailyPrice(dto.getDailyPrice());
        } else {
            room.setWeeklyPrice(null);
            room.setDailyPrice(null);
        }

        room.setReservationPeriod(dto.getReservationPeriod());
        room.setReservedFor(dto.getReservedFor());
        room.setComment(dto.getComment()); // Comment save fix

        RoomType type = dto.getRoomType() != null ? dto.getRoomType() : RoomType.SHARING_2;
        room.setRoomType(type);

        roomRepository.save(room);

        // Auto-generate Beds
        int capacity = type.getCapacity();
        List<Bed> bedList = new ArrayList<>();

        for (int i = 1; i <= capacity; i++) {
            Bed bed = new Bed();
            bed.setBedNumber(dto.getRoomNumber() + "-" + i);
            bed.setIsBooked(false);
            bed.setUnderMaintenance(false);
            bed.setRoom(room);
            bedList.add(bed);
        }

        room.setBeds(bedList);
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
                .monthlyPrice(room.getMonthlyPrice())
                .weeklyPrice(room.getWeeklyPrice())
                .dailyPrice(room.getDailyPrice())
                .roomType(room.getRoomType())
                .reservationPeriod(room.getReservationPeriod())
                .reservedFor(room.getReservedFor())
                .floorNumber(room.getFloor().getFloorNumber())
                .hubNumber(room.getFloor().getHub().getHubNumber())
                .comment(room.getComment())
                .build();
    }

    // ... (අනෙකුත් Get/Delete methods එලෙසම තබන්න) ...
    @Override
    public List<RoomResponseDTO> getPublicRooms() {
        return roomRepository.findByIsPrivateFalse().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<RoomResponseDTO> getPublicRoomsByFloor(Long floorId) {
        return roomRepository.findByFloorIdAndIsPrivateFalse(floorId).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<RoomResponseDTO> getAllRoomsByFloor(Long floorId) {
        return roomRepository.findByFloorId(floorId).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public RoomResponseDTO getRoomById(Long roomId) throws ResourceNotFoundException {
        return roomRepository.findById(roomId).map(this::mapToDTO).orElseThrow(() -> new ResourceNotFoundException("Room not found"));
    }

    @Override
    @Transactional
    public void deleteRoom(Long roomId) throws ResourceNotFoundException {
        if (!roomRepository.existsById(roomId)) throw new ResourceNotFoundException("Room not found");
        roomRepository.deleteById(roomId);
    }

    @Override
    @Transactional
    public void updateReservedFor(Long roomId, ReservedFor reservedFor) throws ResourceNotFoundException {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        room.setReservedFor(reservedFor);
        roomRepository.save(room);
    }

    @Override
    @Transactional
    public void updateIsPrivate(Long roomId, Boolean isPrivate) throws ResourceNotFoundException {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        room.setIsPrivate(isPrivate);
        roomRepository.save(room);
    }

    @Override
    @Transactional
    public void updateReservationPeriod(Long roomId, ReservationPeriod reservationPeriod) throws ResourceNotFoundException {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        room.setReservationPeriod(reservationPeriod);
        roomRepository.save(room);
    }

    @Override
    public List<RoomResponseDTO> getRoomsByPrivacy(Boolean isPrivate) {
        return roomRepository.findByIsPrivate(isPrivate).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<RoomResponseDTO> getRoomsByReservationPeriod(ReservationPeriod reservationPeriod) {
        return roomRepository.findByReservationPeriod(reservationPeriod).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<RoomResponseDTO> getRoomsByReservedFor(ReservedFor reservedFor) {
        return roomRepository.findByReservedFor(reservedFor).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<RoomResponseDTO> getAvailableRooms(Long hubId, LocalDate checkIn, LocalDate checkOut) {
        long days = ChronoUnit.DAYS.between(checkIn, checkOut);
        List<ReservationStatus> activeStatuses = Arrays.asList(ReservationStatus.COMPLETED, ReservationStatus.PENDING, ReservationStatus.APPROVED);
        List<Room> allAvailableRooms = roomRepository.findAvailableRooms(hubId, checkIn, checkOut, activeStatuses);

        return allAvailableRooms.stream()
                .filter(room -> {
                    if (days == 30 || days == 60 || days == 90) return true;
                    return room.getReservationPeriod() == ReservationPeriod.DEFAULT;
                })
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // --- UPDATED METHOD: Room Update Logic ---
    @Override
    @Transactional
    public void updateRoom(Long roomId, CreateRoomRequestDTO dto) throws ResourceNotFoundException {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id " + roomId));

        // 1. සාමාන්‍ය දත්ත යාවත්කාලීන කිරීම
        if (dto.getMonthlyPrice() != null) room.setMonthlyPrice(dto.getMonthlyPrice());
        if (dto.getWeeklyPrice() != null) room.setWeeklyPrice(dto.getWeeklyPrice());
        if (dto.getDailyPrice() != null) room.setDailyPrice(dto.getDailyPrice());
        if (dto.getIsPrivate() != null) room.setIsPrivate(dto.getIsPrivate());
        if (dto.getReservationPeriod() != null) room.setReservationPeriod(dto.getReservationPeriod());
        if (dto.getReservedFor() != null) room.setReservedFor(dto.getReservedFor());
        if (dto.getComment() != null) room.setComment(dto.getComment());

        // 2. Room Number වෙනස් වී ඇත්දැයි පරීක්ෂා කිරීම
        boolean roomNumberChanged = false;
        if (dto.getRoomNumber() != null && !dto.getRoomNumber().equals(room.getRoomNumber())) {
            room.setRoomNumber(dto.getRoomNumber());
            roomNumberChanged = true;
        }

        // 3. Room Type (Capacity) වෙනස් වී ඇත්දැයි පරීක්ෂා කිරීම සහ ඇඳන් යාවත්කාලීන කිරීම
        if (dto.getRoomType() != null && dto.getRoomType() != room.getRoomType()) {
            updateRoomCapacity(room, dto.getRoomType()); // ඇඳන් එකතු කිරීම/ඉවත් කිරීම
            room.setRoomType(dto.getRoomType());
        } else if (roomNumberChanged) {
            // Capacity වෙනස් නොවී නම පමණක් වෙනස් වූවා නම්, ඇඳන් වල නම් අලුත් කරන්න
            refreshBedNames(room);
        }

        roomRepository.save(room);
    }

    // ඇඳන් ගණන පාලනය කරන Logic එක
    private void updateRoomCapacity(Room room, RoomType newType) {
        int newCapacity = newType.getCapacity();
        List<Bed> beds = room.getBeds();

        if (beds == null) {
            beds = new ArrayList<>();
            room.setBeds(beds);
        }

        int currentCount = beds.size();

        if (newCapacity > currentCount) {
            // ධාරිතාව වැඩි නම් (Increase): අලුත් ඇඳන් එකතු කරන්න
            for (int i = currentCount + 1; i <= newCapacity; i++) {
                Bed bed = new Bed();
                bed.setBedNumber(room.getRoomNumber() + "-" + i);
                bed.setIsBooked(false);
                bed.setUnderMaintenance(false);
                bed.setRoom(room);
                beds.add(bed);
                bedRepository.save(bed);
            }
        } else if (newCapacity < currentCount) {
            // ධාරිතාව අඩු නම් (Decrease): අමතර ඇඳන් ඉවත් කරන්න

            // අගින් ඇති ඇඳන් සොයා ගැනීමට Sort කරන්න
            List<Bed> sortedBeds = new ArrayList<>(beds);
            sortedBeds.sort(Comparator.comparingInt(this::getBedIndex));

            List<Bed> bedsToRemove = new ArrayList<>();

            // ඉවත් කළ යුතු ඇඳන් ලිස්ට් එක හදන්න
            for (int i = newCapacity; i < currentCount; i++) {
                Bed bed = sortedBeds.get(i);

                // Book කර ඇති ඇඳක් නම් Error එකක් යවන්න
                if (Boolean.TRUE.equals(bed.getIsBooked())) {
                    throw new AppException("Cannot reduce capacity: Bed " + bed.getBedNumber() + " is currently occupied. Please move the student first.", HttpStatus.CONFLICT);
                }
                bedsToRemove.add(bed);
            }

            // Database සහ List එකෙන් ඉවත් කරන්න
            beds.removeAll(bedsToRemove);
            bedRepository.deleteAll(bedsToRemove);
        }

        // නම් නිවැරදි කිරීම (උදා: Room Number වෙනස් වී ඇත්නම් හෝ මැදින් ඇඳක් අඩු වූවා නම්)
        refreshBedNames(room);
    }

    // ඇඳන් වල නම් පිළිවෙලට සකසන Function එක (R-101-1, R-101-2...)
    private void refreshBedNames(Room room) {
        List<Bed> beds = room.getBeds();
        if (beds == null || beds.isEmpty()) return;

        beds.sort(Comparator.comparingInt(this::getBedIndex));

        for (int i = 0; i < beds.size(); i++) {
            Bed bed = beds.get(i);
            String correctName = room.getRoomNumber() + "-" + (i + 1);

            // නම වැරදි නම් නිවැරදි කර Save කරන්න
            if (!correctName.equals(bed.getBedNumber())) {
                bed.setBedNumber(correctName);
                bedRepository.save(bed);
            }
        }
    }

    // Bed Number එකේ අග කොටස (Index) ලබා ගන්නා Helper Function එක
    private int getBedIndex(Bed bed) {
        try {
            String s = bed.getBedNumber();
            return Integer.parseInt(s.substring(s.lastIndexOf('-') + 1));
        } catch (Exception e) {
            return 0; // Error එකක් ආවොත් 0 දෙන්න
        }
    }
}