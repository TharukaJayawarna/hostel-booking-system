package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.exception.ResourceNotFoundException;
import com.hostel.hostel_backend.model.BlockedDate;
import com.hostel.hostel_backend.model.Reservation;
import com.hostel.hostel_backend.model.ReservationStatus;
import com.hostel.hostel_backend.model.SystemSetting;
import com.hostel.hostel_backend.repository.BlockedDateRepository;
import com.hostel.hostel_backend.repository.ReservationRepository;
import com.hostel.hostel_backend.repository.SystemSettingRepository;
import com.hostel.hostel_backend.service.EmailProducer;
import com.hostel.hostel_backend.service.EmailService;
import com.hostel.hostel_backend.service.SettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SettingsServiceImpl implements SettingsService {

    private final SystemSettingRepository settingRepository;
    private final BlockedDateRepository blockedDateRepository;
    private final ReservationRepository reservationRepository;
    private final EmailService emailService;
    private final EmailProducer emailProducer;

    @Value("${admin.email}")
    private String ADMIN_EMAIL;

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
        List<ReservationStatus> activeStatuses = Arrays.asList(
                ReservationStatus.APPROVED,
                ReservationStatus.PENDING
        );

        List<Reservation> conflicts = reservationRepository.findOverlappingReservationsForAdmin(
                blockedDate.getStartDate(),
                blockedDate.getEndDate(),
                activeStatuses
        );

        if (!conflicts.isEmpty()) {
            log.warn("Blocking dates {} - {} affects {} reservations.",
                    blockedDate.getStartDate(), blockedDate.getEndDate(), conflicts.size());

            sendConflictEmail(blockedDate, conflicts);
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

    private void sendConflictEmail(BlockedDate blockedDate, List<Reservation> conflicts) {
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("startDate", blockedDate.getStartDate());
            variables.put("endDate", blockedDate.getEndDate());
            variables.put("reason", blockedDate.getReason());
            variables.put("conflictCount", conflicts.size());
            variables.put("reservations", conflicts);

            String emailBody = emailService.getHtmlContent("admin-blocked-date-conflict", variables);

            emailProducer.sendEmail(
                    ADMIN_EMAIL,
                    "ACTION REQUIRED: Blocked Date Conflicts Detected ⚠️",
                    emailBody
            );
        } catch (Exception e) {
            log.error("Failed to send conflict email", e);
        }
    }
}