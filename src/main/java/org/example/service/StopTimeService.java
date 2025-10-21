package org.example.service;


import lombok.AllArgsConstructor;
import org.example.model.StopTime;
import org.example.repository.StopTimeRepository;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class StopTimeService {
    private StopTimeRepository stopTimeRepository;

    public void saveStopTime(StopTime stopTime) {
        stopTimeRepository.save(stopTime);
    }
}
