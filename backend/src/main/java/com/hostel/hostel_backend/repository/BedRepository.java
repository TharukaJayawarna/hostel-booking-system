package com.hostel.hostel_backend.repository;

import com.hostel.hostel_backend.model.Bed;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BedRepository extends JpaRepository<Bed, Long> {
    List<Bed> findByIsBooked(Boolean isBooked);
    // Bed එක Free ද? සහ Bed එක තියෙන Room එකේ Price එක සමානද?
    // Spring Data JPA වලට මේ වගේ දිග method names තේරෙනවා (Property Traversal)
    List<Bed> findByIsBookedFalseAndRoomMonthlyPrice(Double monthlyPrice);
    List<Bed> findByRoomId(Long roomId);
}
