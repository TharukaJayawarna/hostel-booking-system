package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.request.CreateHubRequestDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.Hub;
import com.hostel.hostel_backend.repository.HubRepository;
import com.hostel.hostel_backend.service.HubService;
import lombok.AllArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@Service
public class HubServiceImpl implements HubService {

    private HubRepository hubRepository;


    @Override
    public void createHub(CreateHubRequestDTO createHubRequestDTO) {
        Hub hub = new Hub();
        hub.setHubNumber(createHubRequestDTO.getHubNumber());
        hubRepository.save(hub);
    }

    @Override
    public List<Hub> getAllHubs() {
        return hubRepository.findAll();
    }

    @Override
    public Hub getHubById(Long hubId) throws ResourceNotFoundException {
        Hub hub = hubRepository.findById(hubId).orElseThrow(() -> new ResourceNotFoundException("Hub not found with id " +hubId));
        return hub;
    }

    @Override
    public void deleteHub(Long hubId) throws ResourceNotFoundException {
        if (hubRepository.existsById(hubId)) {
            hubRepository.deleteById(hubId);
        }else {
            throw new ResourceNotFoundException("Hub not found with id: " + hubId);
        }
    }
}




