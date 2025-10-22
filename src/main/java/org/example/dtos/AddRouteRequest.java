package org.example.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.example.model.BusStop;

import java.util.HashMap;
import java.util.List;

@Data
public class AddRouteRequest {
    @JsonProperty("busNumber")
    private String busNumber;

    @JsonProperty("direction")
    private int direction;

    @JsonProperty("stopIds")
    private long[] stopIds;
}
