package com.hostel.hostel_backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(name = "hubs")
public class Hub {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String hubNumber;

    @OneToMany(mappedBy = "hub" ,cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Floor> floors;


}
