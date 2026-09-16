CREATE TABLE IF NOT EXISTS raw_telemetry_events
(
    event_id          UUID PRIMARY KEY,
    event_type        VARCHAR(100) NOT NULL,
    schema_version    INTEGER NOT NULL,
    source            VARCHAR(100) NOT NULL,
    host_id           VARCHAR(255) NOT NULL,
    event_timestamp   TIMESTAMPTZ NOT NULL,
    payload_json      TEXT NOT NULL,
    kafka_topic       VARCHAR(255) NOT NULL,
    kafka_partition   INTEGER NOT NULL,
    kafka_offset      BIGINT NOT NULL,
    received_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_raw_telemetry_kafka_position
    UNIQUE (kafka_topic, kafka_partition, kafka_offset)
    );

CREATE INDEX IF NOT EXISTS idx_raw_telemetry_event_timestamp
    ON raw_telemetry_events (event_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_raw_telemetry_host_id
    ON raw_telemetry_events (host_id);