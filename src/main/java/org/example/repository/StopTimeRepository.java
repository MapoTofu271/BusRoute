package org.example.repository;

import org.example.model.StopTime;
import org.example.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StopTimeRepository extends JpaRepository<StopTime, Long> {

}
