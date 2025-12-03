package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.controller.request.CreateFloorRequestDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.Floor;

import java.util.List;

public interface FloorService {
    void createFloor(Long hubId,CreateFloorRequestDTO dto) throws ResourceNotFoundException;
    List<Floor> getAllFloors();
    void deleteFloor(Long floorId) throws ResourceNotFoundException;
    Floor getFloorById(Long floorId) throws ResourceNotFoundException;
}
