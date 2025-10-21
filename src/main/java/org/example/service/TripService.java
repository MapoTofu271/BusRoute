package org.example.service;

import lombok.AllArgsConstructor;
import org.example.model.Trip;
import org.example.repository.TripRepository;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class TripService {
    private TripRepository tripRepository;

    public void saveTrip(Trip trip) {
        tripRepository.save(trip);
    }
}
