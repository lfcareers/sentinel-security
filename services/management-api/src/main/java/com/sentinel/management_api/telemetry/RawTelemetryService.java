package com.sentinel.management_api.telemetry;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class RawTelemetryService {

    private static final int DEFAULT_LIMIT = 10;
    private static final int MAXIMUM_LIMIT = 100;

    private final RawTelemetryRepository repository;
    private final ObjectMapper objectMapper;

    public RawTelemetryService(
            RawTelemetryRepository repository,
            ObjectMapper objectMapper
    ) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public RawTelemetryResponse persist(
            String rawPayload,
            String kafkaTopic,
            int kafkaPartition,
            long kafkaOffset
    ) {
        try {
            JsonNode envelope = objectMapper.readTree(rawPayload);

            UUID eventId = UUID.fromString(
                    requiredText(envelope, "event_id")
            );

            String eventType = requiredText(
                    envelope,
                    "event_type"
            );

            int schemaVersion = envelope
                    .path("schema_version")
                    .asInt(1);

            String source = requiredText(
                    envelope,
                    "source"
            );

            String hostId = requiredText(
                    envelope,
                    "host_id"
            );

            Instant eventTimestamp = Instant.parse(
                    requiredText(envelope, "timestamp")
            );

            JsonNode payload = envelope.path("payload");

            RawTelemetryEntity entity = new RawTelemetryEntity(
                    eventId,
                    eventType,
                    schemaVersion,
                    source,
                    hostId,
                    eventTimestamp,
                    objectMapper.writeValueAsString(payload),
                    kafkaTopic,
                    kafkaPartition,
                    kafkaOffset,
                    Instant.now()
            );

            RawTelemetryEntity saved = repository.save(entity);

            return toResponse(saved);
        } catch (Exception exception) {
            throw new IllegalArgumentException(
                    "Unable to persist raw telemetry event",
                    exception
            );
        }
    }

    @Transactional(readOnly = true)
    public List<RawTelemetryResponse> findRecent(
            Integer requestedLimit
    ) {
        int limit = normalizeLimit(requestedLimit);

        return repository
                .findAllByOrderByEventTimestampDesc(
                        PageRequest.of(0, limit)
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private RawTelemetryResponse toResponse(
            RawTelemetryEntity entity
    ) {
        try {
            return new RawTelemetryResponse(
                    entity.getEventId(),
                    entity.getEventType(),
                    entity.getSchemaVersion(),
                    entity.getSource(),
                    entity.getHostId(),
                    entity.getEventTimestamp(),
                    objectMapper.readTree(entity.getPayloadJson()),
                    entity.getKafkaTopic(),
                    entity.getKafkaPartition(),
                    entity.getKafkaOffset(),
                    entity.getReceivedAt()
            );
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Unable to deserialize persisted telemetry payload",
                    exception
            );
        }
    }

    private int normalizeLimit(Integer requestedLimit) {
        if (requestedLimit == null) {
            return DEFAULT_LIMIT;
        }

        return Math.max(
                1,
                Math.min(requestedLimit, MAXIMUM_LIMIT)
        );
    }

    private String requiredText(
            JsonNode envelope,
            String fieldName
    ) {
        JsonNode value = envelope.get(fieldName);

        if (value == null || value.asText().isBlank()) {
            throw new IllegalArgumentException(
                    "Missing telemetry field: " + fieldName
            );
        }

        return value.asText();
    }
}