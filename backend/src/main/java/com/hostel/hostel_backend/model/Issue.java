package com.hostel.hostel_backend.model;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
@Table(name = "issues")
public class Issue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String studentId;
    private String studentName;
    private String studentEmail;
    private String studentPhone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationPeriod duration;

    private LocalDate checkinDate;
    private LocalDate checkoutDate;
    private String bank;
    private LocalDate paymentDoneDate;
    private String comment;
}
