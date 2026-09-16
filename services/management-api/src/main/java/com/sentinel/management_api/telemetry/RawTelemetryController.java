package com.sentinel.management_api.telemetry;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/telemetry")
public class RawTelemetryController {

    private final RawTelemetryService telemetryService;

    public RawTelemetryController(
            RawTelemetryService telemetryService
    ) {
        this.telemetryService = telemetryService;
    }

    @GetMapping("/recent")
    public List<RawTelemetryResponse> recent(
            @RequestParam(required = false)
            Integer limit
    ) {
        return telemetryService.findRecent(limit);
    }
}