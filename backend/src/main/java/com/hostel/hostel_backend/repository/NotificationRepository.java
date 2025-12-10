package com.hostel.hostel_backend.repository;

import com.hostel.hostel_backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // User කෙනෙකුගේ අලුත්ම Notifications ලබා ගැනීමට (අලුත්ම ඒවා උඩින්)
    List<Notification> findByUserUsernameOrderByCreatedAtDesc(String username);
}