package com.hostel.hostel_backend.repository;

import com.hostel.hostel_backend.model.Floor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FloorRepository extends JpaRepository<Floor, Long> {
    List<Floor> findByHubId(Long hubId);
}
