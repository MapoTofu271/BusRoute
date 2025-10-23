package org.example.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dtos.AddRouteRequest;
import org.example.dtos.BusRouteDto;
import org.example.dtos.RouteResponse;
import org.example.dtos.ApiResponse;
import org.example.service.RouteService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Bus Route management
 * Follows RESTful conventions and proper HTTP status codes
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/routes")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:5500"})
public class BusRouteController {

    private final RouteService routeService;

    /**
     * Create a new bus route
     * POST /api/v1/routes
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RouteResponse>> createRoute(@Valid @RequestBody AddRouteRequest request) {
        log.info("Creating new route for bus number: {}, direction: {}", request.getBusNumber(), request.getDirection());
        
        RouteResponse route = routeService.createRoute(request);
        
        ApiResponse<RouteResponse> response = ApiResponse.<RouteResponse>builder()
                .success(true)
                .message("Route created successfully")
                .data(route)
                .build();
                
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all routes with pagination
     * GET /api/v1/routes
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<RouteResponse>>> getAllRoutes(Pageable pageable) {
        log.info("Fetching all routes with pagination: {}", pageable);
        
        Page<RouteResponse> routes = routeService.getAllRoutes(pageable);
        
        ApiResponse<Page<RouteResponse>> response = ApiResponse.<Page<RouteResponse>>builder()
                .success(true)
                .message("Routes retrieved successfully")
                .data(routes)
                .build();
                
        return ResponseEntity.ok(response);
    }

    /**
     * Get route by ID with stops
     * GET /api/v1/routes/{routeId}
     */
    @GetMapping("/{routeId}")
    public ResponseEntity<ApiResponse<List<BusRouteDto>>> getRouteById(@PathVariable String routeId) {
        log.info("Fetching route details for ID: {}", routeId);
        
        List<BusRouteDto> routeStops = routeService.getRouteWithStops(routeId);
        
        ApiResponse<List<BusRouteDto>> response = ApiResponse.<List<BusRouteDto>>builder()
                .success(true)
                .message("Route details retrieved successfully")
                .data(routeStops)
                .build();
                
        return ResponseEntity.ok(response);
    }

    /**
     * Update an existing route
     * PUT /api/v1/routes/{routeId}
     */
    @PutMapping("/{routeId}")
    public ResponseEntity<ApiResponse<RouteResponse>> updateRoute(
            @PathVariable String routeId,
            @Valid @RequestBody AddRouteRequest request) {
        log.info("Updating route: {}", routeId);
        
        RouteResponse updatedRoute = routeService.updateRoute(routeId, request);
        
        ApiResponse<RouteResponse> response = ApiResponse.<RouteResponse>builder()
                .success(true)
                .message("Route updated successfully")
                .data(updatedRoute)
                .build();
                
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a route
     * DELETE /api/v1/routes/{routeId}
     */
    @DeleteMapping("/{routeId}")
    public ResponseEntity<ApiResponse<Void>> deleteRoute(@PathVariable String routeId) {
        log.info("Deleting route: {}", routeId);
        
        routeService.deleteRoute(routeId);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(true)
                .message("Route deleted successfully")
                .build();
                
        return ResponseEntity.ok(response);
    }

    /**
     * Search routes by bus number
     * GET /api/v1/routes/search?busNumber={busNumber}
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<RouteResponse>>> searchRoutes(
            @RequestParam(required = false) String busNumber,
            @RequestParam(required = false) Integer direction) {
        log.info("Searching routes with busNumber: {}, direction: {}", busNumber, direction);
        
        List<RouteResponse> routes = routeService.searchRoutes(busNumber, direction);
        
        ApiResponse<List<RouteResponse>> response = ApiResponse.<List<RouteResponse>>builder()
                .success(true)
                .message("Search completed successfully")
                .data(routes)
                .build();
                
        return ResponseEntity.ok(response);
    }

    /**
     * Get route statistics
     * GET /api/v1/routes/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getRouteStatistics() {
        log.info("Fetching route statistics");
        
        Object stats = routeService.getRouteStatistics();
        
        ApiResponse<Object> response = ApiResponse.builder()
                .success(true)
                .message("Statistics retrieved successfully")
                .data(stats)
                .build();
                
        return ResponseEntity.ok(response);
    }
}

