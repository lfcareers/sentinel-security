package com.sentinel.management_api.telemetry;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "raw_telemetry_events")
public class RawTelemetryEntity {

    @Id
    @Column(name = "event_id", nullable = false, updatable = false)
    private UUID eventId;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(name = "schema_version", nullable = false)
    private int schemaVersion;

    @Column(name = "source", nullable = false, length = 100)
    private String source;

    @Column(name = "host_id", nullable = false, length = 255)
    private String hostId;

    @Column(name = "event_timestamp", nullable = false)
    private Instant eventTimestamp;

    @Column(name = "payload_json", nullable = false, columnDefinition = "TEXT")
    private String payloadJson;

    @Column(name = "kafka_topic", nullable = false, length = 255)
    private String kafkaTopic;

    @Column(name = "kafka_partition", nullable = false)
    private int kafkaPartition;

    @Column(name = "kafka_offset", nullable = false)
    private long kafkaOffset;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt;

    protected RawTelemetryEntity() {
    }

    public RawTelemetryEntity(
            UUID eventId,
            String eventType,
            int schemaVersion,
            String source,
            String hostId,
            Instant eventTimestamp,
            String payloadJson,
            String kafkaTopic,
            int kafkaPartition,
            long kafkaOffset,
            Instant receivedAt
    ) {
        this.eventId = eventId;
        this.eventType = eventType;
        this.schemaVersion = schemaVersion;
        this.source = source;
        this.hostId = hostId;
        this.eventTimestamp = eventTimestamp;
        this.payloadJson = payloadJson;
        this.kafkaTopic = kafkaTopic;
        this.kafkaPartition = kafkaPartition;
        this.kafkaOffset = kafkaOffset;
        this.receivedAt = receivedAt;
    }

    public UUID getEventId() {
        return eventId;
    }

    public String getEventType() {
        return eventType;
    }

    public int getSchemaVersion() {
        return schemaVersion;
    }

    public String getSource() {
        return source;
    }

    public String getHostId() {
        return hostId;
    }

    public Instant getEventTimestamp() {
        return eventTimestamp;
    }

    public String getPayloadJson() {
        return payloadJson;
    }

    public String getKafkaTopic() {
        return kafkaTopic;
    }

    public int getKafkaPartition() {
        return kafkaPartition;
    }

    public long getKafkaOffset() {
        return kafkaOffset;
    }

    public Instant getReceivedAt() {
        return receivedAt;
    }
}