package com.sentinel.management_api.ingest;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;
import java.util.UUID;

public record IngestSecurityEvent(

        @JsonProperty("alert_id")
        UUID alertId,

        @JsonProperty("source_event_id")
        UUID sourceEventId,

        @JsonProperty("rule_id")
        String ruleId,

        String title,

        String description,

        @JsonProperty("risk_score")
        int riskScore,

        String severity,

        @JsonProperty("host_id")
        String hostId,

        @JsonProperty("process_id")
        Integer processId,

        String action,

        OffsetDateTime timestamp
) {
}