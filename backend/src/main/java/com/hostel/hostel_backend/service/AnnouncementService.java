package com.hostel.hostel_backend.service;

import com.hostel.hostel_backend.model.Announcement;

import java.util.List;

public interface AnnouncementService {
    List<Announcement> getActiveAnnouncements();
    List<Announcement> getAllAnnouncements();
    Announcement createAnnouncement(Announcement announcement) ;
    void deleteAnnouncement(Long id);
}