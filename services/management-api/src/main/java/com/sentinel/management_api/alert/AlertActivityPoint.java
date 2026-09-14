package com.sentinel.management_api.alert;

import java.time.Instant;

public record AlertActivityPoint(
        Instant timestamp,
        long count
) {
}