package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.controller.request.CreateFloorRequestDTO;
import com.hostel.hostel_backend.controller.response.FloorResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;

import java.util.List;

public interface FloorService {
    void createFloor(Long hubId,CreateFloorRequestDTO dto) throws ResourceNotFoundException;
    List<FloorResponseDTO> getAllFloors();
    void deleteFloor(Long floorId) throws ResourceNotFoundException;
    FloorResponseDTO getFloorById(Long floorId) throws ResourceNotFoundException;
}
