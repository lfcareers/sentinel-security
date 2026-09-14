package com.sentinel.management_api.ingest;

import com.sentinel.management_api.alert.SecurityAlertEntity;
import com.sentinel.management_api.alert.SecurityAlertMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ingest")
public class IngestionController {

    private final IngestionService ingestionService;
    private final String ingestKey;

    public IngestionController(
            IngestionService ingestionService,
            @Value("${sentinel.ingest.key}") String ingestKey
    ) {
        this.ingestionService = ingestionService;
        this.ingestKey = ingestKey;
    }

    @PostMapping("/alerts")
    public ResponseEntity<?> ingestAlert(
            @RequestHeader("X-Sentinel-Key") String suppliedKey,
            @RequestBody SecurityAlertMessage message
    ) {

        if (!ingestKey.equals(suppliedKey)) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "invalid ingestion key"));
        }

        if (message.riskScore() < 0 ||
                message.riskScore() > 100) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "error",
                            "risk_score must be between 0 and 100"
                    ));
        }

        SecurityAlertEntity saved =
                ingestionService.ingest(message);

        return ResponseEntity
                .accepted()
                .body(Map.of(
                        "status", "accepted",
                        "alertId",
                        saved.getAlertId().toString()
                ));
    }
}