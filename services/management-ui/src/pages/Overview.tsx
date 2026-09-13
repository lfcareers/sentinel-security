import { useEffect, useMemo, useState } from "react"
import { getAlerts } from "@/api/alerts"
import type { SecurityAlert } from "@/types/security"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"

export default function Overview() {
    const [alerts, setAlerts] = useState<SecurityAlert[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadAlerts() {
            try {
                const data = await getAlerts()
                setAlerts(data)
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load security alerts"
                )
            } finally {
                setLoading(false)
            }
        }

        loadAlerts()
    }, [])

    const highestRisk = useMemo(() => {
        if (alerts.length === 0) {
            return 0
        }

        return Math.max(...alerts.map((alert) => alert.riskScore))
    }, [alerts])

    const highSeverityCount = useMemo(
        () =>
            alerts.filter(
                (alert) =>
                    alert.severity === "HIGH" ||
                    alert.severity === "CRITICAL"
            ).length,
        [alerts]
    )

    if (loading) {
        return (
            <main className="min-h-screen bg-neutral-950 p-6 text-white">
                Loading Sentinel...
            </main>
        )
    }

    if (error) {
        return (
            <main className="min-h-screen bg-neutral-950 p-6 text-white">
                <div className="rounded-xl border border-red-900 bg-red-950/40 p-4">
                    {error}
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <div className="mx-auto max-w-7xl p-6">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
                            Sentinel Security
                        </p>

                        <h1 className="mt-2 text-3xl font-semibold">
                            Security Overview
                        </h1>
                    </div>

                    <div className="rounded-full border border-emerald-900 bg-emerald-950/40 px-4 py-2 text-sm text-emerald-300">
                        System Healthy
                    </div>
                </header>

                <BentoGrid className="mx-auto max-w-7xl">
                    <BentoGridItem
                        title="Security Posture"
                        description={`Highest detected risk score: ${highestRisk}`}
                        className="md:col-span-2"
                    />

                    <BentoGridItem
                        title="Active Alerts"
                        description={`${alerts.length} alerts recorded`}
                    />

                    <BentoGridItem
                        title="High Severity"
                        description={`${highSeverityCount} high-risk detections`}
                    />

                    <BentoGridItem
                        title="Endpoint"
                        description={
                            alerts.length > 0
                                ? alerts[0].hostId
                                : "No endpoint telemetry"
                        }
                    />

                    <BentoGridItem
                        title="Detection Pipeline"
                        description="Agent → Kafka → Alert Engine → Spring Boot → PostgreSQL"
                        className="md:col-span-2"
                    />
                </BentoGrid>

                <section className="mt-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            Recent Detections
                        </h2>

                        <span className="text-sm text-neutral-500">
              {alerts.length} total
            </span>
                    </div>

                    <div className="space-y-3">
                        {alerts.map((alert) => (
                            <article
                                key={alert.alertId}
                                className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5"
                            >
                                <div className="flex items-start justify-between gap-6">
                                    <div>
                                        <div className="mb-2 flex items-center gap-3">
                      <span className="rounded-md border border-red-900 bg-red-950/50 px-2 py-1 text-xs font-medium text-red-300">
                        {alert.severity}
                      </span>

                                            <span className="text-sm text-neutral-500">
                        Risk {alert.riskScore}
                      </span>
                                        </div>

                                        <h3 className="font-medium">
                                            {alert.title}
                                        </h3>

                                        <p className="mt-2 text-sm text-neutral-400">
                                            {alert.description}
                                        </p>

                                        <div className="mt-4 flex flex-wrap gap-4 text-xs text-neutral-500">
                                            <span>Host: {alert.hostId}</span>
                                            <span>PID: {alert.processId ?? "N/A"}</span>
                                            <span>Rule: {alert.ruleId}</span>
                                        </div>
                                    </div>

                                    <time className="whitespace-nowrap text-xs text-neutral-500">
                                        {new Date(alert.createdAt).toLocaleString()}
                                    </time>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}