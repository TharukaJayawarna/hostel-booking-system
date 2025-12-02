package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.controller.request.CreateHubRequestDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.Hub;

import java.util.List;

public interface HubService {
    void createHub(CreateHubRequestDTO createHubRequestDTO);
    List<Hub> getAllHubs();
    Hub getHubById(Long hubId) throws ResourceNotFoundException;
    void deleteHub(Long hubId) throws ResourceNotFoundException;
}
