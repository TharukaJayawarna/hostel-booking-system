package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.request.CreateHubRequestDTO;
import com.hostel.hostel_backend.controller.response.ApiResponse;
import com.hostel.hostel_backend.controller.response.HubResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.service.HubService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/hubs")
@CrossOrigin(origins = "*")
public class HubController {

    private HubService hubService;

    @PostMapping(headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<Void>> createHub(@RequestBody CreateHubRequestDTO createHubRequestDTO) {
        hubService.createHub(createHubRequestDTO);
        return ResponseEntity.ok(ApiResponse.success("Hub created successfully"));
    }

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
