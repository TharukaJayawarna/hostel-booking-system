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
    private final BedRepository bedRepository;

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
        room.setComment(dto.getComment());

        RoomType type = dto.getRoomType() != null ? dto.getRoomType() : RoomType.SHARING_2;
        room.setRoomType(type);

        roomRepository.save(room);

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
                .map(room -> mapToDTO(room, null))
                .collect(Collectors.toList());
    }

    // mapToDTO method eka overload karamu nathnam thiyena eka wenas karamu
    private RoomResponseDTO mapToDTO(Room room, List<Long> bookedBedIds) {
        int total = room.getBeds() != null ? room.getBeds().size() : 0;
        int available = 0;

        if (room.getBeds() != null) {
            available = (int) room.getBeds().stream()
                    .filter(b -> {
                        // 1. Maintenance nam available na
                        if (Boolean.TRUE.equals(b.getUnderMaintenance())) return false;

                        // 2. Booked IDs list ekak dunna nam, eke me bed ID eka thiyenawada balanna
                        if (bookedBedIds != null) {
                            return !bookedBedIds.contains(b.getId());
                        }

                        // 3. Dates dila nattam (General view), parana widiyatama isBooked balanna puluwan
                        return !Boolean.TRUE.equals(b.getIsBooked());
                    })
                    .count();
        }

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
                .availableBeds(available) // Calculated available count
                .totalBeds(total)
                .build();
    }

    @Override
    public List<RoomResponseDTO> getPublicRooms() {
        return roomRepository.findByIsPrivateFalse().stream().map(room -> mapToDTO(room, null)).collect(Collectors.toList());
    }

    @Override
    public List<RoomResponseDTO> getPublicRoomsByFloor(Long floorId) {
        return roomRepository.findByFloorIdAndIsPrivateFalse(floorId).stream().map(room -> mapToDTO(room, null)).collect(Collectors.toList());
    }

    @Override
    public List<RoomResponseDTO> getAllRoomsByFloor(Long floorId) {
        return roomRepository.findByFloorId(floorId).stream().map(room -> mapToDTO(room, null)).collect(Collectors.toList());
    }

    @Override
    public RoomResponseDTO getRoomById(Long roomId) throws ResourceNotFoundException {
        return roomRepository.findById(roomId).map(room -> mapToDTO(room, null)).orElseThrow(() -> new ResourceNotFoundException("Room not found"));
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
        return roomRepository.findByIsPrivate(isPrivate).stream().map(room -> mapToDTO(room, null)).collect(Collectors.toList());
    }

    @Override
    public List<RoomResponseDTO> getRoomsByReservationPeriod(ReservationPeriod reservationPeriod) {
        return roomRepository.findByReservationPeriod(reservationPeriod).stream().map(room -> mapToDTO(room, null)).collect(Collectors.toList());
    }

    @Override
    public List<RoomResponseDTO> getRoomsByReservedFor(ReservedFor reservedFor) {
        return roomRepository.findByReservedFor(reservedFor).stream().map(room -> mapToDTO(room, null)).collect(Collectors.toList());
    }

    @Override
    public List<RoomResponseDTO> getAvailableRooms(Long hubId, LocalDate checkIn, LocalDate checkOut) {
        long days = ChronoUnit.DAYS.between(checkIn, checkOut);
        List<ReservationStatus> activeStatuses = Arrays.asList(
                ReservationStatus.COMPLETED,
                ReservationStatus.PENDING,
                ReservationStatus.APPROVED
        );

        // 1. Search karana dineshaiyata book wela thiyena Bed IDs tika ganna
        List<Long> bookedBedIds = roomRepository.findBookedBedIds(checkIn, checkOut, activeStatuses);

        // 2. Available Rooms tika ganna
        List<Room> allAvailableRooms = roomRepository.findAvailableRooms(hubId, checkIn, checkOut, activeStatuses);

        return allAvailableRooms.stream()
                .filter(room -> {
                    if (days == 30 || days == 60 || days == 90) return true;
                    return room.getReservationPeriod() == ReservationPeriod.DEFAULT;
                })
                // 3. mapToDTO ekata bookedBedIds pass karanna
                .map(room -> mapToDTO(room, bookedBedIds))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateRoom(Long roomId, CreateRoomRequestDTO dto) throws ResourceNotFoundException {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id " + roomId));

        if (dto.getMonthlyPrice() != null) room.setMonthlyPrice(dto.getMonthlyPrice());
        if (dto.getWeeklyPrice() != null) room.setWeeklyPrice(dto.getWeeklyPrice());
        if (dto.getDailyPrice() != null) room.setDailyPrice(dto.getDailyPrice());
        if (dto.getIsPrivate() != null) room.setIsPrivate(dto.getIsPrivate());
        if (dto.getReservationPeriod() != null) room.setReservationPeriod(dto.getReservationPeriod());
        if (dto.getReservedFor() != null) room.setReservedFor(dto.getReservedFor());
        if (dto.getComment() != null) room.setComment(dto.getComment());

        boolean roomNumberChanged = false;
        if (dto.getRoomNumber() != null && !dto.getRoomNumber().equals(room.getRoomNumber())) {
            room.setRoomNumber(dto.getRoomNumber());
            roomNumberChanged = true;
        }

        if (dto.getRoomType() != null && dto.getRoomType() != room.getRoomType()) {
            updateRoomCapacity(room, dto.getRoomType());
            room.setRoomType(dto.getRoomType());
        } else if (roomNumberChanged) {
            refreshBedNames(room);
        }

        roomRepository.save(room);
    }

    private void updateRoomCapacity(Room room, RoomType newType) {
        int newCapacity = newType.getCapacity();
        List<Bed> beds = room.getBeds();

        if (beds == null) {
            beds = new ArrayList<>();
            room.setBeds(beds);
        }

        int currentCount = beds.size();

        if (newCapacity > currentCount) {
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
            List<Bed> sortedBeds = new ArrayList<>(beds);
            sortedBeds.sort(Comparator.comparingInt(this::getBedIndex));

            List<Bed> bedsToRemove = new ArrayList<>();

            for (int i = newCapacity; i < currentCount; i++) {
                Bed bed = sortedBeds.get(i);

                if (Boolean.TRUE.equals(bed.getIsBooked())) {
                    throw new AppException("Cannot reduce capacity: Bed " + bed.getBedNumber() + " is currently occupied. Please move the student first.", HttpStatus.CONFLICT);
                }
                bedsToRemove.add(bed);
            }

            beds.removeAll(bedsToRemove);
            bedRepository.deleteAll(bedsToRemove);
        }

        refreshBedNames(room);
    }

    private void refreshBedNames(Room room) {
        List<Bed> beds = room.getBeds();
        if (beds == null || beds.isEmpty()) return;

        beds.sort(Comparator.comparingInt(this::getBedIndex));

        for (int i = 0; i < beds.size(); i++) {
            Bed bed = beds.get(i);
            String correctName = room.getRoomNumber() + "-" + (i + 1);

            if (!correctName.equals(bed.getBedNumber())) {
                bed.setBedNumber(correctName);
                bedRepository.save(bed);
            }
        }
    }

    private int getBedIndex(Bed bed) {
        try {
            String s = bed.getBedNumber();
            return Integer.parseInt(s.substring(s.lastIndexOf('-') + 1));
        } catch (Exception e) {
            return 0;
        }
    }
}