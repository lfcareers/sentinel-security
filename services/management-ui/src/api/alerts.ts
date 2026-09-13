import type { SecurityAlert } from "@/types/security"

const API_BASE = "http://localhost:8080"

export async function getAlerts(): Promise<SecurityAlert[]> {
    const response = await fetch(`${API_BASE}/api/alerts`)

    if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.status}`)
    }

    return response.json()
}