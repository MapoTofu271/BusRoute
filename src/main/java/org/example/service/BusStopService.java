package org.example.service;


import lombok.AllArgsConstructor;
import org.example.model.BusStop;
import org.example.repository.StopRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class BusStopService {
    private StopRepository stopRepository;
    public List<BusStop> findAll() {
        return stopRepository.findAll();
    }
    public BusStop findById(long id) {
        return stopRepository.findById(id);
    }
}
