package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.request.CreateBedRequestDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.Bed;
import com.hostel.hostel_backend.model.Room;
import com.hostel.hostel_backend.repository.BedRepository;
import com.hostel.hostel_backend.repository.RoomRepository;
import com.hostel.hostel_backend.service.BedService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class BedServiceImpl implements BedService {

    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;

    @Override
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
    public List<Bed> getAllBeds() {
        return bedRepository.findAll();
    }

    @Override
    public Bed getBedById(Long bedId) throws ResourceNotFoundException {
        return bedRepository.findById(bedId).orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + bedId));
    }

    @Override
    public void deleteBedById(Long bedId) throws ResourceNotFoundException {
        if(bedRepository.findById(bedId).isPresent()){
            bedRepository.deleteById(bedId);
        }else {
            throw new ResourceNotFoundException("Bed not found with id: " + bedId);
        }
    }

    @Override
    public List<Bed> getBedsByBookingStatus(Boolean isBooked) {
        return bedRepository.findByIsBooked(isBooked);
    }

}
