package com.hostel.hostel_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "announcements")
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 1000)
    private String message;

    // Types: INFO, WARNING, CRITICAL
    private String type;

    private boolean isActive = true;

    private LocalDateTime createdAt = LocalDateTime.now();
}