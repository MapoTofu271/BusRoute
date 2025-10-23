package org.example.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dtos.ApiResponse;
import org.example.dtos.BusStopResponse;
import org.example.model.BusStop;
import org.example.service.BusStopService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Enhanced Bus Stop Controller with proper REST endpoints
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/stops")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:5500"})
public class BusStopController {

    private final BusStopService busStopService;

    /**
     * Get all bus stops with pagination
     * GET /api/v1/stops
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<BusStopResponse>>> getAllBusStops(Pageable pageable) {
        log.info("Fetching all bus stops with pagination: {}", pageable);
        
        Page<BusStopResponse> stops = busStopService.getAllStops(pageable);
        
        ApiResponse<Page<BusStopResponse>> response = ApiResponse.<Page<BusStopResponse>>builder()
                .success(true)
                .message("Bus stops retrieved successfully")
                .data(stops)
                .build();
                
        return ResponseEntity.ok(response);
    }

    /**
     * Get bus stop by ID
     * GET /api/v1/stops/{stopId}
     */
    @GetMapping("/{stopId}")
    public ResponseEntity<ApiResponse<BusStopResponse>> getBusStopById(@PathVariable Long stopId) {
        log.info("Fetching bus stop with ID: {}", stopId);
        
        BusStopResponse stop = busStopService.getStopById(stopId);
        
        ApiResponse<BusStopResponse> response = ApiResponse.<BusStopResponse>builder()
                .success(true)
                .message("Bus stop retrieved successfully")
                .data(stop)
                .build();
                
        return ResponseEntity.ok(response);
    }

    /**
     * Search bus stops by name or location
     * GET /api/v1/stops/search?name={name}&lat={lat}&lon={lon}&radius={radius}
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<BusStopResponse>>> searchBusStops(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(defaultValue = "1000") Double radius) {
        log.info("Searching bus stops with name: {}, location: [{}, {}], radius: {}", name, lat, lon, radius);
        
        List<BusStopResponse> stops = busStopService.searchStops(name, lat, lon, radius);
        
        ApiResponse<List<BusStopResponse>> response = ApiResponse.<List<BusStopResponse>>builder()
                .success(true)
                .message("Search completed successfully")
                .data(stops)
                .build();
                
        return ResponseEntity.ok(response);
    }

    /**
     * Get bus stops within a bounding box (for map viewport)
     * GET /api/v1/stops/bounds?minLat={minLat}&maxLat={maxLat}&minLon={minLon}&maxLon={maxLon}
     */
    @GetMapping("/bounds")
    public ResponseEntity<ApiResponse<List<BusStopResponse>>> getStopsInBounds(
            @RequestParam Double minLat,
            @RequestParam Double maxLat,
            @RequestParam Double minLon,
            @RequestParam Double maxLon) {
        log.info("Fetching stops in bounds: [{}, {}] to [{}, {}]", minLat, minLon, maxLat, maxLon);
        
        List<BusStopResponse> stops = busStopService.getStopsInBounds(minLat, maxLat, minLon, maxLon);
        
        ApiResponse<List<BusStopResponse>> response = ApiResponse.<List<BusStopResponse>>builder()
                .success(true)
                .message("Stops in bounds retrieved successfully")
                .data(stops)
                .build();
                
        return ResponseEntity.ok(response);
    }

    // Legacy endpoints for backward compatibility
    @Deprecated
    @GetMapping("/all")
    public ResponseEntity<List<BusStop>> showAllStop() {
        log.warn("Using deprecated endpoint /all - please update to use /api/v1/stops");
        List<BusStop> busStopList = busStopService.findAll();
        return ResponseEntity.ok(busStopList);
    }

    @Deprecated
    @GetMapping("/")
    public ResponseEntity<BusStop> showBusStopInfo(@RequestParam long id) {
        log.warn("Using deprecated endpoint / - please update to use /api/v1/stops/{id}");
        return ResponseEntity.ok(busStopService.findById(id));
    }
}
