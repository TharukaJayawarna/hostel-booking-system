package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.controller.request.CreateBedRequestDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.Bed;

import java.util.List;

public interface BedService {
    void createBeds(Long roomId, CreateBedRequestDTO dto) throws ResourceNotFoundException;
    List<Bed> getAllBeds();
    Bed getBedById(Long bedId) throws ResourceNotFoundException;
    void deleteBedById(Long bedId) throws ResourceNotFoundException;
    List<Bed> getBedsByBookingStatus(Boolean isBooked);
}
