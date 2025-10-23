package org.example.dtos;

import lombok.Builder;
import lombok.Data;

/**
 * Response DTO for bus stop information
 */
@Data
@Builder
public class BusStopResponse {
    private Long id;
    private String name;
    private Double latitude;
    private Double longitude;
    private String bench;
    private String shelter;
    private Boolean hasWheelchairAccess;
    private String description;
    
    // Additional computed fields
    private Integer routeCount; // Number of routes serving this stop
    private String nearestLandmark;
    private Double distanceFromUser; // If user location is provided
}