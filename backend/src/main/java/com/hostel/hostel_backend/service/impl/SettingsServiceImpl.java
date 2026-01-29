package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.exception.AppException;
import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.BlockedDate;
import com.hostel.hostel_backend.model.SystemSetting;
import com.hostel.hostel_backend.repository.BlockedDateRepository;
import com.hostel.hostel_backend.repository.SystemSettingRepository;
import com.hostel.hostel_backend.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SettingsServiceImpl implements SettingsService {

    private final SystemSettingRepository settingRepository;
    private final BlockedDateRepository blockedDateRepository;

    @Override
    public Integer getMaxBookingDays() {
        SystemSetting setting = settingRepository.findById("MAX_BOOKING_DAYS")
                .orElse(new SystemSetting("MAX_BOOKING_DAYS", "90"));
        try {
            return Integer.parseInt(setting.getSettingValue());
        } catch (NumberFormatException e) {
            return 90;
        }
    }

    @Override
    @Transactional
    public void updateSettings(Map<String, String> payload) {
        String days = payload.get("MAX_BOOKING_DAYS");
        if (days != null) {
            SystemSetting setting = new SystemSetting("MAX_BOOKING_DAYS", days);
            settingRepository.save(setting);
        }
    }

    @Override
    public List<BlockedDate> getBlockedDates() {
        return blockedDateRepository.findAll();
    }

    @Override
    @Transactional
    public BlockedDate addBlockedDate(BlockedDate blockedDate) {
        if (blockedDate.getStartDate().isAfter(blockedDate.getEndDate())) {
            throw new AppException("Start date cannot be after end date", HttpStatus.BAD_REQUEST);
        }
        return blockedDateRepository.save(blockedDate);
    }

    @Override
    @Transactional
    public void deleteBlockedDate(Long id) throws ResourceNotFoundException {
        if (!blockedDateRepository.existsById(id)) {
            throw new ResourceNotFoundException("Blocked Date not found with ID: " + id);
        }
        blockedDateRepository.deleteById(id);
    }
}