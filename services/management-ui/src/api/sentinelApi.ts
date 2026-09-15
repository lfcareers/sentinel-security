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