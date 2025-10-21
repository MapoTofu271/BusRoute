package org.example.model;


import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.mapping.Join;

@Data
@Entity
@Table(name="trip")
public class Trip {
    @Id
    @Column(name="trip_id")
    private String tripId;

    @ManyToOne
    @JoinColumn(name="route_id")
    private Route route;

}
