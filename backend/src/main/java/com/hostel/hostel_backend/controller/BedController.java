package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.request.CreateBedRequestDTO;
import com.hostel.hostel_backend.controller.response.ApiResponse;
import com.hostel.hostel_backend.controller.response.BedsResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.service.BedService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class BedController {

    private BedService bedService;

    @PostMapping(value = "/rooms/{room-id}/beds", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<Void>> createBeds(@PathVariable("room-id") Long roomId, @RequestBody CreateBedRequestDTO dto) throws ResourceNotFoundException {
        bedService.createBeds(roomId,dto);
        return ResponseEntity.ok(ApiResponse.success("Bed created successfully"));
    }

    @GetMapping(value = "/beds", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<List<BedsResponseDTO>>> getAllBeds(){
        return ResponseEntity.ok(ApiResponse.success("Beds fetched successfully", bedService.getAllBeds()));
    }

    @GetMapping(value = "/beds/{bed-id}", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<BedsResponseDTO>> getBedById(@PathVariable("bed-id") Long bedId) throws ResourceNotFoundException {
        return ResponseEntity.ok(ApiResponse.success("Bed fetched with id "+bedId, bedService.getBedById(bedId)));
    }

    @DeleteMapping(value = "/beds/{bed-id}", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<Void>> deleteBedById(@PathVariable("bed-id") Long bedId) throws ResourceNotFoundException {
        bedService.deleteBedById(bedId);
        return ResponseEntity.ok(ApiResponse.success("Bed deleted successfully"));
    }

    @GetMapping(value = "/beds/filterByStatus", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<List<BedsResponseDTO>>> getBedsByStatus(@RequestParam Boolean isBooked) {
        return ResponseEntity.ok(ApiResponse.success("Bed filtered successfully", bedService.getBedsByBookingStatus(isBooked)));
    }

    @GetMapping(value = "/rooms/{room-id}/beds", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<List<BedsResponseDTO>>> getBedsByRoom(@PathVariable("room-id") Long roomId) {
        return ResponseEntity.ok(ApiResponse.success("Beds fetched", bedService.getBedsByRoomId(roomId)));
    }
}
