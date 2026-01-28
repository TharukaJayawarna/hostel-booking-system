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
    // ඔයා SystemSetting පාවිච්චි කළා නම් SystemSettingRepository ගන්න

    // සෑම දිනකම මධ්‍යම රාත්‍රී 12:00 ට ක්‍රියාත්මක වේ
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void deleteExpiredBlockedDates() {
        LocalDate yesterday = LocalDate.now().minusDays(1);

        // ඊයේ දිනට වඩා පරණ End Date තියෙන Blocked Dates මකා දමන්න
        // ඔයා SystemSetting පාවිච්චි කරනවා නම් query එක පොඩ්ඩක් වෙනස් වෙන්න ඕනේ
        blockedDateRepository.deleteByEndDateBefore(yesterday);

        System.out.println("Expired blocked dates removed successfully.");
    }
}