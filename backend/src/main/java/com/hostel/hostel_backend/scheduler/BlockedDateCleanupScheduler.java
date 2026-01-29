package com.hostel.hostel_backend.scheduler;

import com.hostel.hostel_backend.repository.BlockedDateRepository; // හෝ SystemSettingRepository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
public class BlockedDateCleanupScheduler {

    @Autowired
    private BlockedDateRepository blockedDateRepository;

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void deleteExpiredBlockedDates() {
        LocalDate yesterday = LocalDate.now().minusDays(1);

        blockedDateRepository.deleteByEndDateBefore(yesterday);

        System.out.println("Expired blocked dates removed successfully.");
    }
}