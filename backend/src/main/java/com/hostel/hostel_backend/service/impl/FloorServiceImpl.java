package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.request.CreateFloorRequestDTO;
import com.hostel.hostel_backend.controller.response.FloorResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.Floor;
import com.hostel.hostel_backend.model.Hub;
import com.hostel.hostel_backend.repository.FloorRepository;
import com.hostel.hostel_backend.repository.HubRepository;
import com.hostel.hostel_backend.service.FloorService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional(readOnly = true)
public class FloorServiceImpl implements FloorService {
    private  HubRepository hubRepository;
    private  FloorRepository floorRepository;

    @Override
    @Transactional
    public void createFloor(Long hubId, CreateFloorRequestDTO dto) throws ResourceNotFoundException {
        Hub hub = hubRepository.findById(hubId).orElseThrow(()-> new ResourceNotFoundException("Hub not found with id "+hubId));
        Floor floor = new Floor();
        floor.setHub(hub);
        floor.setFloorNumber(dto.getFloorNumber());
        floorRepository.save(floor);
        if (hub.getFloors() == null) {
            hub.setFloors(new ArrayList<>());
        }

        hub.getFloors().add(floor);
        hubRepository.save(hub);
    }

    @Override
    public List<FloorResponseDTO> getAllFloors() {
       return floorRepository.findAll().stream()
               .map(this::mapToDTO)
               .collect(Collectors.toList());
    }

    private FloorResponseDTO mapToDTO(Floor floor) {
        int roomCount = floor.getRooms() != null ? floor.getRooms().size() : 0;

        return FloorResponseDTO.builder()
                .id(floor.getId())
                .floorNumber(floor.getFloorNumber())
                .noOfRooms(roomCount)
                .build();
    }

    @Override
    @Transactional
    public void deleteFloor(Long id) throws ResourceNotFoundException {
        if(floorRepository.existsById(id)){
            floorRepository.deleteById(id);
        }else throw new ResourceNotFoundException("Floor not found with id "+id);
    }

    @Override
    public FloorResponseDTO getFloorById(Long floorId) throws ResourceNotFoundException {
        return floorRepository.findById(floorId)
                .map(this::mapToDTO)
                .orElseThrow(()-> new ResourceNotFoundException("Floor not found with id "+floorId));
    }
}
