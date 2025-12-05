package com.hostel.hostel_backend.scheduler;

import com.hostel.hostel_backend.model.Reservation;
import com.hostel.hostel_backend.model.ReservationStatus;
import com.hostel.hostel_backend.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TrashCleanupScheduler {

    private final ReservationRepository reservationRepository;

    // දිනපතා මධ්‍යම රාත්‍රියේ (At 00:00) ක්‍රියාත්මක වේ
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void moveOldReservationsToTrash() {
        System.out.println("Running Trash Cleanup Scheduler...");

        // අද දිනට මාස 6කට පෙර දිනය (6 Months Ago)
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);

        // Checkout Date එක මාස 6කට වඩා පරණ, සහ දැනටමත් TRASH නොවන ඒවා සොයාගැනීම
        List<Reservation> oldReservations = reservationRepository.findByToDateBeforeAndReservationStatusNot(
                sixMonthsAgo,
                ReservationStatus.TRASH
        );

        for (Reservation res : oldReservations) {
            res.setReservationStatus(ReservationStatus.TRASH);
            reservationRepository.save(res);
            System.out.println("Moved to Trash: " + res.getReservationNumber());
        }
    }
}