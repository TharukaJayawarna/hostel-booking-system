package com.hostel.hostel_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@ToString
@Table(name = "reservations")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String reservationNumber;// This will be the PayHere Order ID
    private LocalDate fromDate;
    private LocalDate toDate;
    private String studentName;
    private String studentRegistrationNumber;
    private String studentEmail;
    private String studentContactNumber;
    private String studentAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender studentGender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus reservationStatus;

    // Scheduler එකට වෙලාව බලන්න ඕන නිසා
    private LocalDateTime createdDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bed_id")
    @JsonIgnore
    @ToString.Exclude
    private Bed bed;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    @JsonIgnore
    @ToString.Exclude
    private Payment payment;

    @PrePersist
    protected void onCreate() {
        this.createdDate = LocalDateTime.now();
    }
}
