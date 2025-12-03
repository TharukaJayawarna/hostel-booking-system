package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.request.CreateBedRequestDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.Bed;
import com.hostel.hostel_backend.service.BedService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class BedController {

    private BedService bedService;

    @PostMapping(value = "/rooms/{room-id}/beds", headers = "X-Api-Version=v1")
    void createBeds(@PathVariable("room-id") Long roomId, @RequestBody CreateBedRequestDTO dto) throws ResourceNotFoundException {
        bedService.createBeds(roomId,dto);
    }

    @GetMapping(value = "/beds", headers = "X-Api-Version=v1")
    List<Bed> getAllBeds(){
        return bedService.getAllBeds();
    }

    @GetMapping(value = "/beds/{bed-id}", headers = "X-Api-Version=v1")
    Bed getBedById(@PathVariable("bed-id") Long bedId) throws ResourceNotFoundException {
        return bedService.getBedById(bedId);
    }

    @DeleteMapping(value = "/beds/{bed-id}", headers = "X-Api-Version=v1")
    void deleteBedById(@PathVariable("bed-id") Long bedId) throws ResourceNotFoundException {
        bedService.deleteBedById(bedId);
    }

    @GetMapping(value = "/beds/filterByStatus", headers = "X-Api-Version=v1")
    public List<Bed> getBedsByStatus(@RequestParam Boolean isBooked) {
        return bedService.getBedsByBookingStatus(isBooked);
    }
}
