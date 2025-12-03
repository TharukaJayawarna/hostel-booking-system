package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.request.CreateHubRequestDTO;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.Hub;
import com.hostel.hostel_backend.service.HubService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/hubs")
@CrossOrigin(origins = "*")
public class HubController {

    private HubService hubService;

    @PostMapping(headers = "X-Api-Version=v1")
    public void createHub(@RequestBody CreateHubRequestDTO createHubRequestDTO) {
        hubService.createHub(createHubRequestDTO);
    }

    @GetMapping(headers = "X-Api-Version=v1")
    public List<Hub> getAllHubs() {
       return hubService.getAllHubs();
    }

    @GetMapping(value = "/{hub-id}", headers = "X-Api-Version=v1")
    public Hub getHubById(@PathVariable("hub-id") Long hubId) throws ResourceNotFoundException {
        return hubService.getHubById(hubId);
    }

    @DeleteMapping(value = "/{hub-id}", headers = "X-Api-Version=v1")
    public void deleteHub(@PathVariable("hub-id") Long hubId) throws ResourceNotFoundException {
        hubService.deleteHub(hubId);
    }

}
