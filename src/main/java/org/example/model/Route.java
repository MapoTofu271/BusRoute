package org.example.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;


@Data
@Entity
@Table(name="route")
public class Route {

    @Id
    private String routeId;
    private String route_short_name;
    private String route_long_name;
    private int direction;
}
