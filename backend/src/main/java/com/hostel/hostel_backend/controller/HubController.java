package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.request.CreateHubRequestDTO;
import com.hostel.hostel_backend.controller.response.ApiResponse;
import com.hostel.hostel_backend.controller.response.HubResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.service.HubService;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/hubs")
@CrossOrigin(origins = "*")
public class HubController {

    private HubService hubService;

    // වෙනස්කම මෙතනයි: @RequestBody වෙනුවට @ModelAttribute භාවිතා කරන්න
    @PostMapping(headers = "X-Api-Version=v1", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> createHub(
            @ModelAttribute CreateHubRequestDTO createHubRequestDTO, // @RequestBody -> @ModelAttribute
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {

        hubService.createHub(createHubRequestDTO, image);
        return ResponseEntity.ok(ApiResponse.success("Hub created successfully"));
    }

    // ... අනිත් methods එහෙමම තියන්න (getAllHubs, getHubById, deleteHub) ...
    @GetMapping(headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<List<HubResponseDTO>>> getAllHubs() {
        return ResponseEntity.ok(ApiResponse.success("Hubs fetched", hubService.getAllHubs()));
    }

    @GetMapping(value = "/{hub-id}", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<HubResponseDTO>> getHubById(@PathVariable("hub-id") Long hubId) throws ResourceNotFoundException {
        return ResponseEntity.ok(ApiResponse.success("Hub fetched with id " +hubId, hubService.getHubById(hubId))) ;
    }

    @DeleteMapping(value = "/{hub-id}", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<Void>> deleteHub(@PathVariable("hub-id") Long hubId) throws ResourceNotFoundException {
        hubService.deleteHub(hubId);
        return ResponseEntity.ok(ApiResponse.success("Hub deleted successfully"));
    }
}