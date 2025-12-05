package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.request.CreateBedRequestDTO;
import com.hostel.hostel_backend.controller.response.BedsResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.Bed;
import com.hostel.hostel_backend.model.Room;
import com.hostel.hostel_backend.repository.BedRepository;
import com.hostel.hostel_backend.repository.RoomRepository;
import com.hostel.hostel_backend.service.BedService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional(readOnly = true)
public class BedServiceImpl implements BedService {

    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;

    @Override
    @Transactional
    public void createBeds(Long roomId, CreateBedRequestDTO dto) throws ResourceNotFoundException {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
        Bed bed = new Bed();
        bed.setRoom(room);
        bed.setBedNumber(dto.getBedNumber());
        bed.setIsBooked(dto.getIsBooked());
        bedRepository.save(bed);
        if(room.getBeds() == null){
            room.setBeds(new ArrayList<>());
        }
        room.getBeds().add(bed);
        roomRepository.save(room);
    }

    @Override
    public List<BedsResponseDTO> getAllBeds() {
        return bedRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private BedsResponseDTO mapToDTO(Bed bed){
       return BedsResponseDTO.builder()
                .id(bed.getId())
                .bedNumber(bed.getBedNumber())
                .isBooked(bed.getIsBooked())
                .roomNumber(bed.getRoom().getRoomNumber())
                .build();

    }

    @Override
    public BedsResponseDTO getBedById(Long bedId) throws ResourceNotFoundException {
        return bedRepository.findById(bedId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + bedId));
    }

    @Override
    @Transactional
    public void deleteBedById(Long bedId) throws ResourceNotFoundException {
        if(bedRepository.findById(bedId).isPresent()){
            bedRepository.deleteById(bedId);
        }else {
            throw new ResourceNotFoundException("Bed not found with id: " + bedId);
        }
    }

    @Override
    public List<BedsResponseDTO> getBedsByBookingStatus(Boolean isBooked) {
        return bedRepository.findByIsBooked(isBooked).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

}
