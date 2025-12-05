package com.hostel.hostel_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Entity
@Getter
@Setter
@ToString
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String roomNumber;
    private Boolean isPrivate;
    private Double price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationPeriod reservationPeriod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservedFor reservedFor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id")
    @JsonIgnore
    @ToString.Exclude
    private Floor floor;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<Bed> beds;
}
