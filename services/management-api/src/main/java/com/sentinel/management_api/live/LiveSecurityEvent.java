package com.sentinel.management_api.live;

import java.time.OffsetDateTime;

public record LiveSecurityEvent(
        String alertId,
        String severity,
        String hostId,
        String title,
        String description,
        short riskScore,
        String action,
        OffsetDateTime timestamp
) {
}