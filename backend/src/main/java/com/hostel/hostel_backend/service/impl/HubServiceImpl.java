package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.controller.request.CreateHubRequestDTO;
import com.hostel.hostel_backend.controller.response.HubResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.Hub;
import com.hostel.hostel_backend.repository.HubRepository;
import com.hostel.hostel_backend.service.HubService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@Service
@Transactional(readOnly = true)
public class HubServiceImpl implements HubService {

    private HubRepository hubRepository;


    @Override
    @Transactional
    public void createHub(CreateHubRequestDTO createHubRequestDTO) {
        Hub hub = new Hub();
        hub.setHubNumber(createHubRequestDTO.getHubNumber());
        hubRepository.save(hub);
    }

    @Override
    public List<HubResponseDTO> getAllHubs() {
        return hubRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private HubResponseDTO mapToDTO(Hub hub) {
        int floorCount = (hub.getFloors() != null) ? hub.getFloors().size() : 0;

        int roomCount = 0;
        if (hub.getFloors() != null) {
            roomCount = hub.getFloors().stream()
                    .mapToInt(floor -> (floor.getRooms() != null) ? floor.getRooms().size() : 0)
                    .sum();
        }

        return HubResponseDTO.builder()
                .id(hub.getId())
                .hubNumber(hub.getHubNumber())
                .noOfFloors(floorCount)
                .noOfRooms(roomCount)
                .build();
    }

    @Override
    public HubResponseDTO getHubById(Long hubId) throws ResourceNotFoundException {
       return hubRepository.findById(hubId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Hub not found with id " +hubId));

    }

    @Override
    @Transactional
    public void deleteHub(Long hubId) throws ResourceNotFoundException {
        if (hubRepository.existsById(hubId)) {
            hubRepository.deleteById(hubId);
        }else {
            throw new ResourceNotFoundException("Hub not found with id: " + hubId);
        }
    }
}




