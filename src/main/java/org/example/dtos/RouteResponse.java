package org.example.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Response DTO for route information
 */
@Data
@Builder
public class RouteResponse {
    private String routeId;
    private String busNumber;
    private String routeShortName;
    private String routeLongName;
    private Integer direction;
    private String directionName;
    private Integer stopCount;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public String getDirectionName() {
        return direction != null ? (direction == 0 ? "Outbound" : "Return") : null;
    }
}