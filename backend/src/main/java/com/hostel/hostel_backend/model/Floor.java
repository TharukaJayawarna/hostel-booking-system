package com.hostel.hostel_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(name = "floors")
public class Floor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String floorNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hub_id")
    @JsonIgnore
    private Hub hub;

    @OneToMany(mappedBy = "floor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Room> rooms;
}
