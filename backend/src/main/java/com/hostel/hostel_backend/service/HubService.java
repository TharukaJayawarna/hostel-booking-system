package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.controller.request.CreateHubRequestDTO;
import com.hostel.hostel_backend.controller.response.HubResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;

import java.util.List;

public interface HubService {
    void createHub(CreateHubRequestDTO createHubRequestDTO);
    List<HubResponseDTO> getAllHubs();
    HubResponseDTO getHubById(Long hubId) throws ResourceNotFoundException;
    void deleteHub(Long hubId) throws ResourceNotFoundException;
}
