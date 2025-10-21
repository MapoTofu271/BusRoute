package org.example;


import com.fasterxml.jackson.databind.ObjectMapper;
import org.aspectj.weaver.ast.Test;
import org.example.model.BusStop;
import org.example.repository.StopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;

@SpringBootApplication//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class Main implements CommandLineRunner {
   @Autowired
    private StopRepository stopRepository;
    public static void main(String[] args) throws IOException {
        SpringApplication.run(Main.class, args);
    }
    @Override
    public void run(String... args) throws Exception {
        loadData();
    }
    private void loadData() throws IOException {
        final Path path = Path.of("src/main/resources/stop.json");
        ObjectMapper mapper = new ObjectMapper();
        String content = Files.readString(path, StandardCharsets.UTF_8).trim();
        BusStop[] busStops = mapper.readValue(content, BusStop[].class);
        for(BusStop stop : busStops) {
            stopRepository.save(stop);
        }

    }
}