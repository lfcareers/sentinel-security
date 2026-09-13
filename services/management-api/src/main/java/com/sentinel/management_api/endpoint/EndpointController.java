package com.sentinel.management_api.endpoint;

import com.sentinel.management_api.alert.SecurityAlertRepository;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/endpoints")
public class EndpointController {

    private final SecurityAlertRepository repository;

    public EndpointController(
            SecurityAlertRepository repository
    ) {
        this.repository = repository;
    }

    @GetMapping
    public List<EndpointSummary> getEndpoints() {

        return repository
                .findEndpointSummaries()
                .stream()
                .map(row -> new EndpointSummary(
                        (String) row[0],
                        (Long) row[1],
                        ((Number) row[2]).intValue(),
                        (OffsetDateTime) row[3]
                ))
                .toList();
    }
}