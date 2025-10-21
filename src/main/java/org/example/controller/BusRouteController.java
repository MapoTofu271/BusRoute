package org.example.controller;

import lombok.AllArgsConstructor;
import org.example.dtos.AddRouteRequest;
import org.example.dtos.BusRouteDto;
import org.example.service.RouteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("api/busRoute")
@AllArgsConstructor
public class BusRouteController {

    private RouteService routeService;
    @PostMapping("/addRoute")
    /*
    The problem is that when we use application/x-www-form-urlencoded,
     Spring doesn't understand it as a RequestBody.
     So, if we want to use this we must remove the @RequestBody annotation.
     */
    public void addRoute(@RequestBody AddRouteRequest request) {
        routeService.addRoute(request);
    }

    @GetMapping("")
        public ResponseEntity<List<BusRouteDto>> getBusRoute(@RequestParam String routeId) {
            List<BusRouteDto> fullRoute = routeService.findRouteOfBusId(routeId);
            return ResponseEntity.ok(fullRoute);
        }
    }

