package org.example.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name="stop_times")
public class StopTime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="trip_id")
    private Trip trip;

    @ManyToOne
    @JoinColumn(name="stop_id")
    private BusStop busStop;

    private int stopSequence;



}
