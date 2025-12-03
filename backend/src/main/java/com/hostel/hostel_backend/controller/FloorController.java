package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.request.CreateFloorRequestDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.Floor;
import com.hostel.hostel_backend.model.Hub;
import com.hostel.hostel_backend.service.impl.FloorServiceImpl;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class FloorController {

    private FloorServiceImpl floorService;

    @PostMapping(value ="/hubs/{hub-id}/floors", headers = "X-Api-Version=v1")
    public void createFloor(@PathVariable ("hub-id") Long hubId, @RequestBody CreateFloorRequestDTO dto) throws ResourceNotFoundException {
        floorService.createFloor(hubId, dto);
    }

    @GetMapping(value ="/floors", headers = "X-Api-Version=v1")
    public List<Floor> getAllFloors() {
        return floorService.getAllFloors();
    }

    @DeleteMapping(value = "/floors/{floor-id}", headers = "X-Api-Version=v1")
    public void deleteFloor(@PathVariable("floor-id") Long floorId) throws ResourceNotFoundException {
        floorService.deleteFloor(floorId);
    }
    @GetMapping(value = "/floors/{floor-id}", headers = "X-Api-Version=v1")
    public Floor getFloorById(@PathVariable("floor-id") Long floorId) throws ResourceNotFoundException {
        return floorService.getFloorById(floorId);
    }

}
