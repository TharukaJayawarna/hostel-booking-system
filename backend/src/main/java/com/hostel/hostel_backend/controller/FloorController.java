package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.request.CreateFloorRequestDTO;
import com.hostel.hostel_backend.controller.response.ApiResponse;
import com.hostel.hostel_backend.controller.response.FloorResponseDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.service.FloorService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class FloorController {

    private FloorService floorService;

    @PostMapping(value ="/hubs/{hub-id}/floors", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<Void>> createFloor(@PathVariable ("hub-id") Long hubId, @RequestBody CreateFloorRequestDTO dto) throws ResourceNotFoundException {
        floorService.createFloor(hubId, dto);
        return ResponseEntity.ok(ApiResponse.success("Floor created successfully"));
    }

    @GetMapping(value ="/floors", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<List<FloorResponseDTO>>> getAllFloors() {
        return ResponseEntity.ok(ApiResponse.success("Floors fetched", floorService.getAllFloors())) ;
    }

    @DeleteMapping(value = "/floors/{floor-id}", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<Void>> deleteFloor(@PathVariable("floor-id") Long floorId) throws ResourceNotFoundException {
        floorService.deleteFloor(floorId);
        return ResponseEntity.ok(ApiResponse.success("Floor deleted successfully"));
    }
    @GetMapping(value = "/floors/{floor-id}", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<FloorResponseDTO>> getFloorById(@PathVariable("floor-id") Long floorId) throws ResourceNotFoundException {
        return ResponseEntity.ok(ApiResponse.success("Floor fetched with id" + floorId, floorService.getFloorById(floorId)));
    }

    @GetMapping(value = "/hubs/{hub-id}/floors", headers = "X-Api-Version=v1")
    public ResponseEntity<ApiResponse<List<FloorResponseDTO>>> getFloorsByHub(@PathVariable("hub-id") Long hubId) {
        return ResponseEntity.ok(ApiResponse.success("Floors fetched", floorService.getFloorsByHubId(hubId)));
    }
}
