package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.response.ApiResponse;
import com.hostel.hostel_backend.model.BlockedDate;
import com.hostel.hostel_backend.model.SystemSetting;
import com.hostel.hostel_backend.repository.BlockedDateRepository;
import com.hostel.hostel_backend.repository.SystemSettingRepository;
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

    private final SystemSettingRepository settingRepository;
    private final BlockedDateRepository blockedDateRepository;

    // 1. අගය ලබා ගැනීම (Student/Admin දෙගොල්ලොන්ටම පුළුවන්)
    @GetMapping("/max-days")
    public ResponseEntity<ApiResponse<Integer>> getMaxBookingDays() {
        SystemSetting setting = settingRepository.findById("MAX_BOOKING_DAYS")
                .orElse(new SystemSetting("MAX_BOOKING_DAYS", "90")); // Default දින 90යි

        return ResponseEntity.ok(ApiResponse.success("Fetched", Integer.parseInt(setting.getSettingValue())));
    }

    // 2. අගය වෙනස් කිරීම (Admin ට පමණයි)
    @PostMapping("/update")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateSettings(@RequestBody Map<String, String> payload) {
        String days = payload.get("MAX_BOOKING_DAYS");
        if (days != null) {
            SystemSetting setting = new SystemSetting("MAX_BOOKING_DAYS", days);
            settingRepository.save(setting);
        }
        return ResponseEntity.ok(ApiResponse.success("Settings updated successfully"));
    }

    // 1. Get all blocked dates
    @GetMapping("/blocked-dates")
    public ResponseEntity<ApiResponse<List<BlockedDate>>> getBlockedDates() {
        List<BlockedDate> dates = blockedDateRepository.findAll();
        return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Fetched Blocked Dates", dates));
    }

    // 2. Add a new blocked date
    @PostMapping("/blocked-dates")
    public ResponseEntity<ApiResponse<BlockedDate>> addBlockedDate(@RequestBody BlockedDate blockedDate) {
        // Validation: Start date shouldn't be after End date
        if (blockedDate.getStartDate().isAfter(blockedDate.getEndDate())) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("ERROR", "Start date cannot be after end date", null));
        }

        BlockedDate saved = blockedDateRepository.save(blockedDate);
        return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Date Blocked", saved));
    }

    // 3. Delete a blocked date
    @DeleteMapping("/blocked-dates/{id}")
    public ResponseEntity<ApiResponse<String>> deleteBlockedDate(@PathVariable Long id) {
        if (blockedDateRepository.existsById(id)) {
            blockedDateRepository.deleteById(id);
            return ResponseEntity.ok(new ApiResponse<>("SUCCESS", "Unblocked Successfully", null));
        }
        return ResponseEntity.status(404).body(new ApiResponse<>("ERROR", "ID not found", null));
    }
}