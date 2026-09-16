package com.sentinel.management_api.telemetry;

import tools.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

public record RawTelemetryResponse(
        UUID eventId,
        String eventType,
        int schemaVersion,
        String source,
        String hostId,
        Instant timestamp,
        JsonNode payload,
        String kafkaTopic,
        int kafkaPartition,
        long kafkaOffset,
        Instant receivedAt
) {
}