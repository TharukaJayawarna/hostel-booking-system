package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.model.Notification;
import com.hostel.hostel_backend.model.User;

import java.util.List;

public interface NotificationService {
    void createNotification(User user, String title, String message);
    List<Notification> getMyNotifications(String username);
    void markAsRead(Long id);
    void clearAllNotifications(String username);
}
