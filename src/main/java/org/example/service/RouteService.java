package org.example.service;


import lombok.AllArgsConstructor;
import org.example.dtos.AddRouteRequest;
import org.example.dtos.BusRouteDto;
import org.example.model.BusStop;
import org.example.model.Route;
import org.example.model.StopTime;
import org.example.model.Trip;
import org.example.repository.RouteRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Objects;

@Service
@AllArgsConstructor
public class RouteService {
    private RouteRepository routeRepository;

    private BusStopService busStopService;
    private TripService tripService;
    private StopTimeService stopTimeService;


    public void saveRoute(Route route) {
        routeRepository.save(route);
    }

    public List<BusRouteDto> findRouteOfBusId(String routeId) {
        return routeRepository.findRouteStopWithSequence(routeId);
    }

/*    public long[] convertStopIdToInt(String[] stopIds) {
        long[] res = new long[stopIds.length];
        for(int i = 0; i < stopIds.length; i++) {
            System.out.println(stopIds[i]);
            if(!Objects.equals(stopIds[i], "[") && !Objects.equals(stopIds[i], "]")) {
                res[i] = Integer.parseInt(stopIds[i]);
            }
        }

        return res;
    }*/

    public void addRoute(@RequestBody AddRouteRequest request){

        Route newRoute = new Route();
        newRoute.setRouteId(request.getRouteId() + "_" + request.getDirection());
        newRoute.setRoute_short_name("Tuyến " + request.getRouteId());
        newRoute.setDirection(request.getDirection());
        long[] list = request.getStopIds();

       // long[] list = convertStopIdToInt(request.getStopIds());
        BusStop startPoint = busStopService.findById(list[0]);
        BusStop endPoint  = busStopService.findById(list[(list.length-1)]);
        String longRouteName = startPoint.getName() + "đến " + endPoint.getName();
        newRoute.setRoute_long_name(longRouteName);
        saveRoute(newRoute);

        for(int i = 0; i < list.length; i++) {
            Trip trip = new Trip();
            StopTime stopTime = new StopTime();
            trip.setRoute(newRoute);
            trip.setTripId(request.getRouteId() + "_" + request.getDirection()
                    + request.getDirection() + "_"
                    + i );
            tripService.saveTrip(trip);

            stopTime.setStopSequence(i);
            stopTime.setBusStop(busStopService.findById(list[i]));
            stopTime.setTrip(trip);
            stopTimeService.saveStopTime(stopTime);
        }
    }
}

