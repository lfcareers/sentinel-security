const API_BASE =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export type SystemHealth = {
    api: string;
    database: string;
    kafka: string;
};
export async function getAlertStats() {
    const response = await fetch(`${API_BASE}/api/alerts/stats`);

    if (!response.ok) {
        throw new Error(`Alert stats request failed: ${response.status}`);
    }

    return response.json();
}

export async function getRecentAlerts() {
    const response = await fetch(`${API_BASE}/api/alerts/recent`);

    if (!response.ok) {
        throw new Error(`Recent alerts request failed: ${response.status}`);
    }

    return response.json();
}

export async function getEndpoints() {
    const response = await fetch(`${API_BASE}/api/endpoints`);

    if (!response.ok) {
        throw new Error(`Endpoint request failed: ${response.status}`);
    }

    return response.json();
}

export async function getSystemHealth(): Promise<SystemHealth> {
    const response = await fetch(`${API_BASE}/api/system/health`);

    if (!response.ok) {
        throw new Error(`System health request failed: ${response.status}`);
    }

    return response.json();
}
export type RawTelemetryEvent = {
    event_id: string;
    event_type: string;
    schema_version: number;
    source: string;
    host_id: string;
    timestamp: string;
    payload: Record<string, unknown>;
    kafka_topic?: string;
    kafka_partition?: number;
    kafka_offset?: number;
    received_at?: string;
};

type PersistedTelemetryEvent = {
    eventId: string;
    eventType: string;
    schemaVersion: number;
    source: string;
    hostId: string;
    timestamp: string;
    payload: Record<string, unknown>;
    kafkaTopic: string;
    kafkaPartition: number;
    kafkaOffset: number;
    receivedAt: string;
};

export async function getRecentTelemetry(
    limit = 10
): Promise<RawTelemetryEvent[]> {
    const response = await fetch(
        `${API_BASE}/api/telemetry/recent?limit=${limit}`
    );

    if (!response.ok) {
        throw new Error(
            `Recent telemetry request failed: ${response.status}`
        );
    }

    const events: PersistedTelemetryEvent[] =
        await response.json();

    return events.map((event) => ({
        event_id: event.eventId,
        event_type: event.eventType,
        schema_version: event.schemaVersion,
        source: event.source,
        host_id: event.hostId,
        timestamp: event.timestamp,
        payload: event.payload,
        kafka_topic: event.kafkaTopic,
        kafka_partition: event.kafkaPartition,
        kafka_offset: event.kafkaOffset,
        received_at: event.receivedAt,
    }));
}
