package org.example.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class BusRouteDto {
    private double lat;
    private double lon;
    private int sequence;
    private String name;
}
