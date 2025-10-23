package org.example.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Enhanced Route entity with proper JPA relationships and audit fields
 */
@Data
@Entity
@Table(name = "route", indexes = {
    @Index(name = "idx_route_direction", columnList = "direction"),
    @Index(name = "idx_route_short_name", columnList = "route_short_name")
})
@EqualsAndHashCode(exclude = {"trips"})
@ToString(exclude = {"trips"})
public class Route {

    @Id
    @Column(name = "route_id", length = 50)
    private String routeId;

    @Column(name = "route_short_name", length = 100, nullable = false)
    private String route_short_name;

    @Column(name = "route_long_name", length = 255)
    private String route_long_name;

    @Column(name = "direction", nullable = false)
    private Integer direction;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "color", length = 7)
    private String color; // Hex color code for route display

    @Column(name = "text_color", length = 7)
    private String textColor;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Trip> trips;

    // Helper methods
    public String getDirectionName() {
        return direction != null ? (direction == 0 ? "Outbound" : "Return") : null;
    }

    public void addTrip(Trip trip) {
        trips.add(trip);
        trip.setRoute(this);
    }

    public void removeTrip(Trip trip) {
        trips.remove(trip);
        trip.setRoute(null);
    }
}
