package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.response.ApiResponse;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.BlockedDate;
import com.hostel.hostel_backend.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping("/max-days")
    public ResponseEntity<ApiResponse<Integer>> getMaxBookingDays() {
        return ResponseEntity.ok(ApiResponse.success("Fetched", settingsService.getMaxBookingDays()));
    }

    @PostMapping("/update")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateSettings(@RequestBody Map<String, String> payload) {
        settingsService.updateSettings(payload);
        return ResponseEntity.ok(ApiResponse.success("Settings updated successfully"));
    }

    // 1. Get all blocked dates
    @GetMapping("/blocked-dates")
    public ResponseEntity<ApiResponse<List<BlockedDate>>> getBlockedDates() {
        return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Fetched Blocked Dates", settingsService.getBlockedDates()));
    }

    // 2. Add a new blocked date
    @PostMapping("/blocked-dates")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<BlockedDate>> addBlockedDate(@RequestBody BlockedDate blockedDate) {
        // Exception handling is now done in GlobalExceptionHandler via Service exception
        BlockedDate saved = settingsService.addBlockedDate(blockedDate);
        return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Date Blocked", saved));
    }

    // 3. Delete a blocked date
    @DeleteMapping("/blocked-dates/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteBlockedDate(@PathVariable Long id) throws ResourceNotFoundException {
        settingsService.deleteBlockedDate(id);
        return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Unblocked Successfully", null));
    }
}