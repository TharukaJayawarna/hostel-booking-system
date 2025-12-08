package com.hostel.hostel_backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.hostel.hostel_backend.controller.request.CreateHubRequestDTO;
import com.hostel.hostel_backend.controller.response.HubResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.Hub;
import com.hostel.hostel_backend.repository.HubRepository;
import com.hostel.hostel_backend.service.HubService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class HubServiceImpl implements HubService {

    private final HubRepository hubRepository;
    private final Cloudinary cloudinary; // Cloudinary Bean eka inject karagannawa

    @Override
    @Transactional
    public void createHub(CreateHubRequestDTO dto, MultipartFile image) throws IOException {
        Hub hub = new Hub();
        hub.setHubNumber(dto.getHubNumber());
        hub.setDescription(dto.getDescription());

        if (image != null && !image.isEmpty()) {
            // Cloudinary ekata upload karanawa
            Map uploadResult = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.emptyMap());

            // Upload wuna image eke URL eka gannawa
            String imageUrl = (String) uploadResult.get("url");

            // URL eka database eke save karanawa
            hub.setImagePath(imageUrl);
        }

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
                .description(hub.getDescription())
                // Cloudinary URL eka kelinma thiyena nisa modification one na
                .image(hub.getImagePath())
                .noOfFloors(floorCount)
                .noOfRooms(roomCount)
                .build();
    }

    @Override
    public HubResponseDTO getHubById(Long hubId) throws ResourceNotFoundException {
        return hubRepository.findById(hubId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Hub not found with id " + hubId));
    }

    @Override
    @Transactional
    public void deleteHub(Long hubId) throws ResourceNotFoundException {
        if (hubRepository.existsById(hubId)) {
            // Amathara deyak: Oya kamathi nam methana Cloudinary walin image eka delete karana logic ekath liyanna puluwan.
            // Namuth database eken delete kirima pamanak pramanawath.
            hubRepository.deleteById(hubId);
        } else {
            throw new ResourceNotFoundException("Hub not found with id: " + hubId);
        }
    }
}