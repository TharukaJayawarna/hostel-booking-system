package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.controller.request.CreateBedRequestDTO;
import com.hostel.hostel_backend.controller.response.BedsResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;

import java.util.List;

public interface BedService {
    void createBeds(Long roomId, CreateBedRequestDTO dto) throws ResourceNotFoundException;
    List<BedsResponseDTO> getAllBeds();
    BedsResponseDTO getBedById(Long bedId) throws ResourceNotFoundException;
    void deleteBedById(Long bedId) throws ResourceNotFoundException;
    List<BedsResponseDTO> getBedsByBookingStatus(Boolean isBooked);
}
