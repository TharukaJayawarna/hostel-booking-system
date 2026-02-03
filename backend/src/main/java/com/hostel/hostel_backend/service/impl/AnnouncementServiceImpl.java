package com.hostel.hostel_backend.service.impl;

import com.hostel.hostel_backend.model.Announcement;
import com.hostel.hostel_backend.repository.AnnouncementRepository;
import com.hostel.hostel_backend.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {
    private final AnnouncementRepository repository;

    public List<Announcement> getActiveAnnouncements() {
        return repository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    public List<Announcement> getAllAnnouncements() {
        return repository.findAll();
    }

    public Announcement createAnnouncement(Announcement announcement) {
        return repository.save(announcement);
    }

    public void deleteAnnouncement(Long id) {
        repository.deleteById(id);
    }
}
