package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.model.Notification;
import com.hostel.hostel_backend.model.User;
import com.hostel.hostel_backend.repository.NotificationRepository;
import com.hostel.hostel_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    public void createNotification(User user, String title, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notificationRepository.save(notification);
    }

    public List<Notification> getMyNotifications(String username) {
        return notificationRepository.findByUserUsernameOrderByCreatedAtDesc(username);
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void clearAllNotifications(String username) {
        // User ගේ username එක අනුව notifications සොයා ඉවත් කිරීම
        List<Notification> notifications = notificationRepository.findByUserUsernameOrderByCreatedAtDesc(username);
        notificationRepository.deleteAll(notifications);
    }
}
