package org.example.controller;

import lombok.AllArgsConstructor;
import org.example.model.BusStop;
import org.example.service.BusStopService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/busStop")
@AllArgsConstructor
public class BusStopController {

    private BusStopService busStopService;

    @GetMapping("/all")
    public ResponseEntity<List<BusStop>> showAllStop() {
        List<BusStop> busStopList = busStopService.findAll();
        return ResponseEntity.ok(busStopList);
    }

    @GetMapping("/")
    public ResponseEntity<BusStop> showBusStopInfo(@RequestParam long id) {
        return  ResponseEntity.ok(busStopService.findById(id));
    }
}
