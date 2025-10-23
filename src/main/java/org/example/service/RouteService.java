package org.example.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dtos.AddRouteRequest;
import org.example.dtos.BusRouteDto;
import org.example.dtos.RouteResponse;
import org.example.exception.ResourceNotFoundException;
import org.example.exception.ValidationException;
import org.example.model.BusStop;
import org.example.model.Route;
import org.example.model.StopTime;
import org.example.model.Trip;
import org.example.repository.RouteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enhanced Route Service with proper business logic and error handling
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RouteService {
    
    private final RouteRepository routeRepository;
    private final BusStopService busStopService;
    private final TripService tripService;
    private final StopTimeService stopTimeService;

    /**
     * Create a new route with validation and proper error handling
     */
    public RouteResponse createRoute(AddRouteRequest request) {
        log.info("Creating route for bus number: {}, direction: {}", request.getBusNumber(), request.getDirection());
        
        // Validate request
        validateRouteRequest(request);
        
        // Check if route already exists
        String routeId = generateRouteId(request.getBusNumber(), request.getDirection());
        if (routeRepository.existsById(routeId)) {
            throw new ValidationException("Route already exists for bus " + request.getBusNumber() + " direction " + request.getDirection());
        }
        
        // Validate all stops exist
        List<BusStop> stops = validateAndGetStops(request.getStopIds());
        
        // Create route
        Route route = createRouteEntity(request, stops);
        Route savedRoute = routeRepository.save(route);
        
        // Create trip and stop times
        createTripAndStopTimes(savedRoute, stops);
        
        log.info("Successfully created route: {}", routeId);
        return mapToRouteResponse(savedRoute, stops.size());
    }

    /**
     * Get all routes with pagination
     */
    @Transactional(readOnly = true)
    public Page<RouteResponse> getAllRoutes(Pageable pageable) {
        Page<Route> routePage = routeRepository.findAll(pageable);
        
        List<RouteResponse> responses = routePage.getContent().stream()
                .map(route -> {
                    int stopCount = getStopCountForRoute(route.getRouteId());
                    return mapToRouteResponse(route, stopCount);
                })
                .collect(Collectors.toList());
                
        return new PageImpl<>(responses, pageable, routePage.getTotalElements());
    }

    /**
     * Get route with stops by ID
     */
    @Transactional(readOnly = true)
    public List<BusRouteDto> getRouteWithStops(String routeId) {
        if (!routeRepository.existsById(routeId)) {
            throw new ResourceNotFoundException("Route", routeId);
        }
        
        List<BusRouteDto> stops = routeRepository.findRouteStopWithSequence(routeId);
        if (stops.isEmpty()) {
            log.warn("No stops found for route: {}", routeId);
        }
        
        return stops;
    }

    /**
     * Update an existing route
     */
    public RouteResponse updateRoute(String routeId, AddRouteRequest request) {
        log.info("Updating route: {}", routeId);
        
        Route existingRoute = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route", routeId));
        
        validateRouteRequest(request);
        List<BusStop> stops = validateAndGetStops(request.getStopIds());
        
        // Update route entity
        updateRouteEntity(existingRoute, request, stops);
        Route savedRoute = routeRepository.save(existingRoute);
        
        // Recreate trip and stop times
        deleteTripAndStopTimes(routeId);
        createTripAndStopTimes(savedRoute, stops);
        
        log.info("Successfully updated route: {}", routeId);
        return mapToRouteResponse(savedRoute, stops.size());
    }

    /**
     * Delete a route and all associated data
     */
    public void deleteRoute(String routeId) {
        log.info("Deleting route: {}", routeId);
        
        if (!routeRepository.existsById(routeId)) {
            throw new ResourceNotFoundException("Route", routeId);
        }
        
        // Delete associated trips and stop times (cascade should handle this)
        deleteTripAndStopTimes(routeId);
        
        // Delete route
        routeRepository.deleteById(routeId);
        
        log.info("Successfully deleted route: {}", routeId);
    }

    /**
     * Search routes by criteria
     */
    @Transactional(readOnly = true)
    public List<RouteResponse> searchRoutes(String busNumber, Integer direction) {
        // This would require custom repository methods
        List<Route> routes = routeRepository.findAll().stream()
                .filter(route -> {
                    boolean matches = true;
                    if (busNumber != null && !busNumber.isEmpty()) {
                        matches = route.getRouteId().contains(busNumber);
                    }
                    if (direction != null) {
                        matches = matches && route.getDirection().equals(direction);
                    }
                    return matches;
                })
                .collect(Collectors.toList());
                
        return routes.stream()
                .map(route -> {
                    int stopCount = getStopCountForRoute(route.getRouteId());
                    return mapToRouteResponse(route, stopCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get route statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getRouteStatistics() {
        long totalRoutes = routeRepository.count();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRoutes", totalRoutes);
        stats.put("routesByDirection", getRoutesByDirection());
        stats.put("averageStopsPerRoute", getAverageStopsPerRoute());
        
        return stats;
    }

    // Private helper methods
    
    private void validateRouteRequest(AddRouteRequest request) {
        Map<String, String> errors = new HashMap<>();
        
        if (request.getStopIds() == null || request.getStopIds().length < 2) {
            errors.put("stopIds", "Route must have at least 2 stops");
        }
        
        if (request.getDirection() == null || (request.getDirection() != 0 && request.getDirection() != 1)) {
            errors.put("direction", "Direction must be 0 (outbound) or 1 (return)");
        }
        
        if (!errors.isEmpty()) {
            throw new ValidationException("Invalid route data", errors);
        }
    }

    private List<BusStop> validateAndGetStops(Long[] stopIds) {
        List<BusStop> stops = new ArrayList<>();
        
        for (Long stopId : stopIds) {
            BusStop stop = busStopService.findById(stopId);
            if (stop == null) {
                throw new ResourceNotFoundException("Bus Stop", stopId);
            }
            stops.add(stop);
        }
        
        return stops;
    }

    private String generateRouteId(String busNumber, Integer direction) {
        return busNumber + "_" + direction;
    }

    private Route createRouteEntity(AddRouteRequest request, List<BusStop> stops) {
        Route route = new Route();
        route.setRouteId(generateRouteId(request.getBusNumber(), request.getDirection()));
        route.setRoute_short_name("Tuyến " + request.getBusNumber());
        route.setDirection(request.getDirection());
        
        // Generate long name from start and end stops
        BusStop startStop = stops.get(0);
        BusStop endStop = stops.get(stops.size() - 1);
        String longName = startStop.getName() + " đến " + endStop.getName();
        route.setRoute_long_name(longName);
        
        return route;
    }

    private void updateRouteEntity(Route route, AddRouteRequest request, List<BusStop> stops) {
        route.setRoute_short_name("Tuyến " + request.getBusNumber());
        
        BusStop startStop = stops.get(0);
        BusStop endStop = stops.get(stops.size() - 1);
        String longName = startStop.getName() + " đến " + endStop.getName();
        route.setRoute_long_name(longName);
    }

    private void createTripAndStopTimes(Route route, List<BusStop> stops) {
        for (int i = 0; i < stops.size(); i++) {
            Trip trip = new Trip();
            trip.setRoute(route);
            trip.setTripId(route.getRouteId() + "_" + i);
            Trip savedTrip = tripService.saveTrip(trip);

            StopTime stopTime = new StopTime();
            stopTime.setStopSequence(i);
            stopTime.setBusStop(stops.get(i));
            stopTime.setTrip(savedTrip);
            stopTimeService.saveStopTime(stopTime);
        }
    }

    private void deleteTripAndStopTimes(String routeId) {
        // This would require additional repository methods
        // For now, rely on cascade delete
    }

    private RouteResponse mapToRouteResponse(Route route, int stopCount) {
        return RouteResponse.builder()
                .routeId(route.getRouteId())
                .busNumber(extractBusNumber(route.getRouteId()))
                .routeShortName(route.getRoute_short_name())
                .routeLongName(route.getRoute_long_name())
                .direction(route.getDirection())
                .stopCount(stopCount)
                .createdAt(LocalDateTime.now()) // You'd want to add these fields to your entity
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private String extractBusNumber(String routeId) {
        return routeId.split("_")[0];
    }

    private int getStopCountForRoute(String routeId) {
        return getRouteWithStops(routeId).size();
    }

    private Map<String, Long> getRoutesByDirection() {
        List<Route> routes = routeRepository.findAll();
        return routes.stream()
                .collect(Collectors.groupingBy(
                    route -> route.getDirection() == 0 ? "Outbound" : "Return",
                    Collectors.counting()
                ));
    }

    private double getAverageStopsPerRoute() {
        List<Route> routes = routeRepository.findAll();
        if (routes.isEmpty()) return 0.0;
        
        double totalStops = routes.stream()
                .mapToInt(route -> getStopCountForRoute(route.getRouteId()))
                .sum();
                
        return totalStops / routes.size();
    }

    // Legacy methods for backward compatibility
    @Deprecated
    public void saveRoute(Route route) {
        routeRepository.save(route);
    }

    @Deprecated
    public List<BusRouteDto> findRouteOfBusId(String routeId) {
        return getRouteWithStops(routeId);
    }

    @Deprecated
    public void addRoute(AddRouteRequest request) {
        createRoute(request);
    }
}

