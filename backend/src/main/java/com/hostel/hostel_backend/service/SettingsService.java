package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.BlockedDate;
import java.util.List;
import java.util.Map;

public interface SettingsService {
    Integer getMaxBookingDays();
    void updateSettings(Map<String, String> payload);
    List<BlockedDate> getBlockedDates();
    BlockedDate addBlockedDate(BlockedDate blockedDate);
    void deleteBlockedDate(Long id) throws ResourceNotFoundException;
}