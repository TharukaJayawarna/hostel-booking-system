package com.hostel.hostel_backend.scheduler;

import com.hostel.hostel_backend.model.*;
import com.hostel.hostel_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReservationCleanupScheduler {

    private final ReservationRepository reservationRepository;
    private final BedRepository bedRepository;

    @Scheduled(fixedRate = 900000) // Every 15 minutes
    @Transactional
    public void cleanupPendingReservations() {
        LocalDateTime expirationTime = LocalDateTime.now().minusMinutes(30);

        List<Reservation> expiredList = reservationRepository.findAllByReservationStatusAndCreatedDateBefore(
                ReservationStatus.PENDING, expirationTime
        );

        for (Reservation res : expiredList) {
            res.setReservationStatus(ReservationStatus.REJECTED);

            Bed bed = res.getBed();
            if (bed != null) {
                bed.setIsBooked(false);
                bedRepository.save(bed);
            }
            reservationRepository.save(res);
            System.out.println("Cancelled expired reservation: " + res.getReservationNumber());
        }
    }

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void markCompletedReservations() {
        System.out.println("Running Completed Reservation Scheduler...");

        List<Reservation> finishedReservations = reservationRepository.findByReservationStatusAndToDateBefore(
                ReservationStatus.APPROVED,
                LocalDate.now()
        );

        for (Reservation res : finishedReservations) {
            res.setReservationStatus(ReservationStatus.COMPLETED);

            Bed bed = res.getBed();
            if (bed != null) {
                bed.setIsBooked(false);
                bedRepository.save(bed);
            }

            reservationRepository.save(res);
            System.out.println("Marked as COMPLETED: " + res.getReservationNumber());
        }
    }
}