package org.example.repository;

import org.example.model.BusStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StopRepository extends JpaRepository<BusStop, Long>  {
    BusStop findById(long id);
}

