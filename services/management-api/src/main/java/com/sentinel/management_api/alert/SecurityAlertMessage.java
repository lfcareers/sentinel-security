package com.sentinel.management_api.alert;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;
import java.util.UUID;

public record SecurityAlertMessage(

        @JsonProperty("alert_id")
        UUID alertId,

        @JsonProperty("source_event_id")
        UUID sourceEventId,

        @JsonProperty("rule_id")
        String ruleId,

        String title,

        String description,

        @JsonProperty("risk_score")
        short riskScore,

        String severity,

        @JsonProperty("host_id")
        String hostId,

        @JsonProperty("process_id")
        Long processId,

        String action,

        OffsetDateTime timestamp
) {
}