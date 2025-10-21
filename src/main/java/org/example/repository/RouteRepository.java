package org.example.repository;

import org.example.dtos.BusRouteDto;
import org.example.model.BusStop;
import org.example.model.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RouteRepository extends JpaRepository<Route, String> {
    @Query(value = """
            SELECT s.lat, s.lon, st.stop_sequence, s.name 
            FROM route r 
            INNER JOIN trip t ON r.route_id = t.route_id 
            INNER JOIN stop_times st ON t.trip_id = st.trip_id
            INNER JOIN stop s ON s.id = st.stop_id
            WHERE r.route_id LIKE :routeId
            ORDER BY st.stop_sequence
            """, nativeQuery = true)
    List<BusRouteDto> findRouteStopWithSequence(@Param("routeId") String routeId);
}