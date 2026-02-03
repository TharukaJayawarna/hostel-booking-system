package com.hostel.hostel_backend.controller;

import com.hostel.hostel_backend.controller.response.ApiResponse;
import com.hostel.hostel_backend.model.Announcement;
import com.hostel.hostel_backend.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/announcements")
@RequiredArgsConstructor
public class AnnouncementController {
    private final AnnouncementService service;

    // Public/Student Endpoint
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Announcement>>> getActive() {
        return ResponseEntity.ok(ApiResponse.success("Active announcements", service.getActiveAnnouncements()));
    }

    // Admin Endpoints
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Announcement>> create(@RequestBody Announcement announcement) {
        return ResponseEntity.ok(ApiResponse.success("Created", service.createAnnouncement(announcement)));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<Announcement>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("All announcements", service.getAllAnnouncements()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted"));
    }
}