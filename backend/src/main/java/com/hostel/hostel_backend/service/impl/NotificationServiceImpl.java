package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.model.Notification;
import com.hostel.hostel_backend.model.User;
import com.hostel.hostel_backend.repository.NotificationRepository;
import com.hostel.hostel_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void createNotification(User user, String title, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        Notification savedNotification = notificationRepository.save(notification);
        messagingTemplate.convertAndSend("/topic/notifications/" + user.getUsername(), savedNotification);
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
        List<Notification> notifications = notificationRepository.findByUserUsernameOrderByCreatedAtDesc(username);
        notificationRepository.deleteAll(notifications);
    }
}
