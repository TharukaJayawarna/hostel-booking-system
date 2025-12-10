package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.response.ApiResponse;
import com.hostel.hostel_backend.model.Notification;
import com.hostel.hostel_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", notificationService.getMyNotifications(username)));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Marked as read"));
    }

    @DeleteMapping("/clear")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> clearNotifications() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        notificationService.clearAllNotifications(username);
        return ResponseEntity.ok(ApiResponse.success("Notifications cleared successfully"));
    }
}