package com.hostel.hostel_backend.repository;

import com.hostel.hostel_backend.model.BlockedDate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface BlockedDateRepository extends JpaRepository<BlockedDate, Long> {

    // Check if the requested range overlaps with any blocked period
    @Query("SELECT COUNT(b) > 0 FROM BlockedDate b WHERE " +
            "(:endDate >= b.startDate) AND (:startDate <= b.endDate)")
    boolean existsOverlappingDate(@Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate);

    @Modifying
    @Transactional
    void deleteByEndDateBefore(LocalDate date);
}