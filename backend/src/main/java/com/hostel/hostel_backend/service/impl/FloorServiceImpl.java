package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.request.CreateFloorRequestDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.Floor;
import com.hostel.hostel_backend.model.Hub;
import com.hostel.hostel_backend.repository.FloorRepository;
import com.hostel.hostel_backend.repository.HubRepository;
import com.hostel.hostel_backend.service.FloorService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class FloorServiceImpl implements FloorService {
    private  HubRepository hubRepository;
    private  FloorRepository floorRepository;

    @Override
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
    public List<Floor> getAllFloors() {
       return floorRepository.findAll();
    }

    @Override
    public void deleteFloor(Long id) throws ResourceNotFoundException {
        if(floorRepository.existsById(id)){
            floorRepository.deleteById(id);
        }else throw new ResourceNotFoundException("Floor not found with id "+id);
    }

    @Override
    public Floor getFloorById(Long floorId) throws ResourceNotFoundException {
        return floorRepository.findById(floorId).orElseThrow(()-> new ResourceNotFoundException("Floor not found with id "+floorId));
    }
}
