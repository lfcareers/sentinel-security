package com.sentinel.management_api.endpoint;

import java.time.OffsetDateTime;

public record EndpointSummary(
        String hostId,
        long alertCount,
        int highestRisk,
        OffsetDateTime lastActivity
) {
}