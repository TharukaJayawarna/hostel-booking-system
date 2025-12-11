package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.response.ApiResponse;
import com.hostel.hostel_backend.model.SystemSetting;
import com.hostel.hostel_backend.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SettingsController {

    private final SystemSettingRepository settingRepository;

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
}