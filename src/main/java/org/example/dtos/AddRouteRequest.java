package org.example.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Request DTO for creating/updating bus routes
 */
@Data
public class AddRouteRequest {
    
    @NotBlank(message = "Bus number is required")
    @Size(min = 1, max = 10, message = "Bus number must be between 1 and 10 characters")
    @JsonProperty("busNumber")
    private String busNumber;

    @NotNull(message = "Direction is required")
    @Min(value = 0, message = "Direction must be 0 (outbound) or 1 (return)")
    @Max(value = 1, message = "Direction must be 0 (outbound) or 1 (return)")
    @JsonProperty("direction")
    private Integer direction;

    @NotNull(message = "Stop IDs are required")
    @Size(min = 2, message = "Route must have at least 2 stops")
    @JsonProperty("stopIds")
    private Long[] stopIds;

    @Size(max = 255, message = "Route description cannot exceed 255 characters")
    @JsonProperty("description")
    private String description;
}
