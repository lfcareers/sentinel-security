package com.sentinel.management_api.alert;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class SecurityAlertController {

    private final SecurityAlertRepository repository;
    private final SecurityAlertService securityAlertService;

    public SecurityAlertController(
            SecurityAlertRepository repository,
            SecurityAlertService securityAlertService
    ) {
        this.repository = repository;
        this.securityAlertService = securityAlertService;
    }

    @GetMapping("/activity")
    public List<AlertActivityPoint> getActivity(
            @RequestParam(defaultValue = "24") int hours
    ) {
        return securityAlertService.getActivity(hours);
    }

    @GetMapping("/recent")
    public List<SecurityAlertEntity> getRecentAlerts() {
        return repository.findTop10ByOrderByCreatedAtDesc();
    }

    @GetMapping("/stats")
    public AlertStats getStats() {

        long total = repository.count();

        long high =
                repository.countBySeverityIgnoreCase("HIGH");

        long critical =
                repository.countBySeverityIgnoreCase("CRITICAL");

        Double average = repository.findAverageRiskScore();

        Integer highest = repository.findHighestRiskScore();

        long hosts = repository.countUniqueHosts();

        return new AlertStats(
                total,
                high,
                critical,
                average == null ? 0 : average,
                highest == null ? 0 : highest,
                hosts
        );
    }
}