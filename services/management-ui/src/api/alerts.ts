import type { SecurityAlert } from "@/types/security"

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"

type RecentAlertsResponse = {
    value?: SecurityAlert[]
    Count?: number
}

export async function getAlerts(): Promise<SecurityAlert[]> {
    const response = await fetch(
        `${API_BASE_URL}/api/alerts/recent`
    )

    if (!response.ok) {
        throw new Error(
            `Failed to fetch alerts: ${response.status}`
        )
    }

    const data: RecentAlertsResponse | SecurityAlert[] =
        await response.json()

    // Support either a direct JSON array or PowerShell-style/wrapped response.
    if (Array.isArray(data)) {
        return data
    }

    if (Array.isArray(data.value)) {
        return data.value
    }

    console.error(
        "Unexpected /api/alerts/recent response:",
        data
    )

    return []
}