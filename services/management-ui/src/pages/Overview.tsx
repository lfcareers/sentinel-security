import { useEffect, useState } from "react"
import { getAlerts } from "@/api/alerts"
import {
    getAlertStats,
    getEndpoints,
    getRecentTelemetry,
    getSystemHealth,
} from "@/api/sentinelApi"

import type {
    RawTelemetryEvent,
    SystemHealth,
} from "@/api/sentinelApi"
import type { SecurityAlert } from "@/types/security"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import SentinelNavbar from "@/components/SentinelNavbar"

const WINDOWS_DOWNLOAD_URL =
    "https://github.com/lfcareers/sentinel-security/releases/latest/download/Sentinel-Security-0.1.0-x64-setup.exe"

const RELEASE_NOTES_URL =
    "https://github.com/lfcareers/sentinel-security/releases/tag/v0.1.0"

type LiveSecurityEvent = {
    alertId: string
    severity: string
    hostId: string
    title: string
    description: string
    riskScore: number
    action: string
    timestamp: string
}

type StreamStatus = "connecting" | "live" | "disconnected"

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"

type AlertStats = {
    totalAlerts: number
    highSeverity: number
    criticalSeverity: number
    averageRiskScore: number
    highestRiskScore: number
    uniqueHosts: number
}

type EndpointSummary = {
    hostId: string
    alertCount: number
    highestRisk: number
    lastActivity: string
}
export default function Overview() {
    const [alerts, setAlerts] = useState<SecurityAlert[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [streamStatus, setStreamStatus] =
        useState<StreamStatus>("connecting")
    const [lastEventAt, setLastEventAt] = useState<string | null>(null)
    const [stats, setStats] = useState<AlertStats | null>(null)
    const [endpoints, setEndpoints] =
        useState<EndpointSummary[] | null>(null)
    const [systemHealth, setSystemHealth] =
        useState<SystemHealth | null>(null)
    const [rawEvents, setRawEvents] =
        useState<RawTelemetryEvent[]>([])
    const [selectedRawEventId, setSelectedRawEventId] =
        useState<string | null>(null)

    const [followLive, setFollowLive] = useState(true)


    useEffect(() => {
        void getAlertStats()
            .then(setStats)
            .catch((dashboardError) => {
                console.error(
                    "Failed to load alert statistics:",
                    dashboardError
                )
            })

        void getEndpoints()
            .then(setEndpoints)
            .catch((dashboardError) => {
                console.error(
                    "Failed to load endpoint summaries:",
                    dashboardError
                )
            })

        void getSystemHealth()
            .then(setSystemHealth)
            .catch((dashboardError) => {
                console.error(
                    "Failed to load system health:",
                    dashboardError
                )
            })
    }, [])

    useEffect(() => {
        const loadRecentTelemetry = async () => {
            try {
                const persistedEvents =
                    await getRecentTelemetry(10)

                setRawEvents((currentEvents) => {
                    const eventsById = new Map<
                        string,
                        RawTelemetryEvent
                    >()

                    for (const event of [
                        ...currentEvents,
                        ...persistedEvents,
                    ]) {
                        eventsById.set(event.event_id, event)
                    }

                    return Array.from(eventsById.values())
                        .sort(
                            (left, right) =>
                                new Date(right.timestamp).getTime() -
                                new Date(left.timestamp).getTime()
                        )
                        .slice(0, 100)
                })
            } catch (error) {
                console.error(
                    "Failed to load persisted telemetry:",
                    error
                )
            }
        }

        void loadRecentTelemetry()
    }, [])

    useEffect(() => {
        async function loadAlerts() {
            try {
                const data = await getAlerts()
                setAlerts(Array.isArray(data) ? data : [])
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

    useEffect(() => {
        const eventSource = new EventSource(
            `${API_BASE_URL}/api/events/stream`
        )

        eventSource.onopen = () => {
            setStreamStatus("live")
        }

        const handleSecurityAlert = (event: MessageEvent<string>) => {
            try {
                const liveEvent: LiveSecurityEvent = JSON.parse(event.data)

                const alert: SecurityAlert = {
                    alertId: liveEvent.alertId,
                    severity: liveEvent.severity,
                    hostId: liveEvent.hostId,
                    title: liveEvent.title,
                    description: liveEvent.description,
                    riskScore: liveEvent.riskScore,
                    action: liveEvent.action,
                    createdAt: liveEvent.timestamp,
                    processId: null,
                    ruleId: "LIVE_STREAM",
                    sourceEventId: liveEvent.alertId,
                }

                setAlerts((current) => {
                    const withoutDuplicate = current.filter(
                        (existing) => existing.alertId !== alert.alertId
                    )
                    return [alert, ...withoutDuplicate]
                })

                setLastEventAt(liveEvent.timestamp)
                setStreamStatus("live")
            } catch (err) {
                console.error("Failed to parse Sentinel SSE event:", err)
            }
        }

        const handleRawTelemetry = (event: MessageEvent<string>) => {
            try {
                const rawEvent: RawTelemetryEvent = JSON.parse(event.data)

                setRawEvents((current) => {
                    const withoutDuplicate = current.filter(
                        (existing) => existing.event_id !== rawEvent.event_id
                    )
                    return [rawEvent, ...withoutDuplicate].slice(0, 100)
                })

                setLastEventAt(rawEvent.timestamp)
                setStreamStatus("live")
            } catch (err) {
                console.error("Failed to parse raw Sentinel telemetry:", err)
            }
        }

        eventSource.addEventListener("security-alert", handleSecurityAlert)
        eventSource.addEventListener("raw-telemetry", handleRawTelemetry)

        eventSource.onerror = () => {
            setStreamStatus("disconnected")
        }

        return () => {
            eventSource.removeEventListener("security-alert", handleSecurityAlert)
            eventSource.removeEventListener("raw-telemetry", handleRawTelemetry)
            eventSource.close()
        }
    }, [])

    useEffect(() => {
        if (followLive && rawEvents.length > 0) {
            setSelectedRawEventId(rawEvents[0].event_id)
        }
    }, [rawEvents, followLive])

    const latestAlert = alerts[0]
    const latestRawEvent = rawEvents[0]

    const selectedRawEvent =
        rawEvents.find(
            (event) =>
                event.event_id === selectedRawEventId
        ) ?? latestRawEvent

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <SentinelNavbar />

            <div
                id="overview"
                className="mx-auto max-w-7xl p-6"
            >
                <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="mb-3 flex items-center gap-3">
                            <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
                                Sentinel Security
                            </p>

                            <span className="rounded border border-neutral-800 px-2 py-1 text-[10px] uppercase tracking-wider text-neutral-500">
                            Runtime Telemetry
                        </span>
                        </div>

                        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                            Security Operations
                        </h1>

                        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
                            Lightweight endpoint telemetry generated by Rust,
                            transported through Kafka, interpreted by the
                            management plane, and streamed to operators in
                            real time.
                        </p>
                    </div>

                    <StreamIndicator status={streamStatus} />
                </header>

                {loading && (
                    <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm text-neutral-400">
                        Loading persisted security telemetry...
                    </div>
                )}

                {error && (
                    <div className="mb-6 rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300">
                        Alert history unavailable: {error}
                    </div>
                )}

                <BentoGrid className="mx-auto max-w-7xl">
                    <section className="mt-6 overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-neutral-950 to-neutral-950 p-6 shadow-2xl shadow-emerald-950/20">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-2xl">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)]" />

                                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                    Windows Community Preview
                </span>
                                </div>

                                <h2 className="text-2xl font-semibold tracking-tight text-white">
                                    Run Sentinel on your computer
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-neutral-400">
                                    Download the native Windows application and perform a fast
                                    endpoint process scan powered locally by Rust. Scan results
                                    remain on your device.
                                </p>

                                <p className="mt-3 text-xs text-neutral-500">
                                    Version 0.1.0 · Windows x64 · Community Preview
                                </p>
                            </div>

                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                                <a
                                    href={WINDOWS_DOWNLOAD_URL}
                                    className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-neutral-950"
                                >
                                    Download for Windows
                                </a>

                                <a
                                    href={RELEASE_NOTES_URL}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 px-6 py-3 text-sm font-semibold text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-950"
                                >
                                    Release notes
                                </a>
                            </div>
                        </div>

                        <div className="mt-5 border-t border-neutral-800 pt-4 text-xs leading-5 text-neutral-500">
                            Sentinel 0.1.0 is an unsigned preview. Windows SmartScreen may display
                            an unknown-publisher warning. SHA-256 checksums are available on the
                            release page.
                        </div>
                    </section>
                    {/* Primary telemetry inspector */}

                    <BentoGridItem
                        title="Live Telemetry Inspector"
                        className="md:col-span-3"
                    >
                        <div className="overflow-hidden rounded-xl border border-neutral-800 bg-black/20">
                            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                                        Kafka Event Stream
                                    </p>

                                    <p className="mt-1 font-mono text-[10px] text-neutral-600">
                                        {rawEvents.length} events available
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setFollowLive(true)

                                        if (latestRawEvent) {
                                            setSelectedRawEventId(
                                                latestRawEvent.event_id
                                            )
                                        }
                                    }}
                                    className={`rounded-md border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider ${
                                        followLive
                                            ? "border-emerald-800 bg-emerald-950/40 text-emerald-400"
                                            : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
                                    }`}
                                >
                                    {followLive ? "Following Live" : "Resume Live"}
                                </button>
                            </div>

                            <div className="grid min-h-[420px] lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.6fr)]">
                                <div className="max-h-[420px] overflow-y-auto border-b border-neutral-800 lg:border-b-0 lg:border-r">
                                    {rawEvents.length === 0 ? (
                                        <p className="p-4 font-mono text-xs text-neutral-600">
                                            Waiting for Kafka telemetry...
                                        </p>
                                    ) : (
                                        rawEvents.map((event) => {
                                            const selected =
                                                event.event_id ===
                                                selectedRawEvent?.event_id

                                            return (
                                                <button
                                                    key={event.event_id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedRawEventId(
                                                            event.event_id
                                                        )
                                                        setFollowLive(false)
                                                    }}
                                                    className={`flex w-full items-center justify-between gap-4 border-b border-neutral-900 px-4 py-3 text-left transition-colors ${
                                                        selected
                                                            ? "bg-emerald-950/20"
                                                            : "hover:bg-neutral-900/70"
                                                    }`}
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate font-mono text-xs text-neutral-300">
                                                            {event.event_type}
                                                        </p>

                                                        <p className="mt-1 truncate font-mono text-[10px] text-neutral-600">
                                                            {event.host_id}
                                                            {event.kafka_offset !==
                                                            undefined
                                                                ? ` · offset ${event.kafka_offset}`
                                                                : ""}
                                                        </p>
                                                    </div>

                                                    <time className="shrink-0 font-mono text-[10px] text-neutral-600">
                                                        {new Date(
                                                            event.timestamp
                                                        ).toLocaleTimeString()}
                                                    </time>
                                                </button>
                                            )
                                        })
                                    )}
                                </div>

                                <div className="max-h-[420px] overflow-auto p-5">
                                    {selectedRawEvent ? (
                                        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-neutral-300">
                {JSON.stringify(
                    selectedRawEvent,
                    null,
                    2
                )}
            </pre>
                                    ) : (
                                        <p className="font-mono text-xs text-neutral-600">
                                            Select an event to inspect its payload.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </BentoGridItem>

                    {/* KPI cards */}

                    <BentoGridItem title="Risk">
                        <Metric
                            value={stats?.highestRiskScore ?? "—"}
                            label="highest observed"
                        />
                    </BentoGridItem>

                    <BentoGridItem title="Detections">
                        <Metric
                            value={stats?.totalAlerts ?? "—"}
                            label="persisted events"
                        />
                    </BentoGridItem>

                    <BentoGridItem title="Endpoints">
                        <Metric
                            value={endpoints?.length ?? "—"}
                            label="reporting hosts"
                        />
                    </BentoGridItem>

                    {/* Event transport */}

                    <BentoGridItem
                        title="Event Transport"
                        className="md:col-span-2"
                    >
                        <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs">
                            <PipelineNode label="Rust" />
                            <PipelineArrow />
                            <PipelineNode label="Kafka" />
                            <PipelineArrow />
                            <PipelineNode label="Spring" />
                            <PipelineArrow />
                            <PipelineNode label="SSE" />
                            <PipelineArrow />
                            <PipelineNode label="React" />
                        </div>

                        <div className="mt-5 flex items-center gap-2 text-xs text-neutral-500">
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    streamStatus === "live"
                                        ? "bg-emerald-400"
                                        : "bg-amber-400"
                                }`}
                            />

                            {streamStatus === "live"
                                ? "Real-time transport operational"
                                : "Transport reconnecting"}
                        </div>
                    </BentoGridItem>

                    <BentoGridItem title="High Severity">
                        <Metric
                            value={stats?.highSeverity ?? "—"}
                            label="high severity alerts"
                        />
                    </BentoGridItem>

                    <BentoGridItem title="System Health">
                        <div className="mt-2 space-y-3">
                            <HealthRow
                                label="API"
                                status={systemHealth?.api}
                            />

                            <HealthRow
                                label="Database"
                                status={systemHealth?.database}
                            />

                            <HealthRow
                                label="Kafka"
                                status={systemHealth?.kafka}
                            />
                        </div>
                    </BentoGridItem>

                    {/* Detection feed INSIDE Bento */}

                    <BentoGridItem
                        title="Detection Feed"
                        className="md:col-span-3"
                    >
                        <div className="max-h-[420px] overflow-y-auto rounded-xl border border-neutral-800 bg-black/20">
                            {alerts.length === 0 ? (
                                <div className="p-6 text-sm text-neutral-500">
                                    No detections recorded.
                                </div>
                            ) : (
                                alerts.map((alert, index) => (
                                    <article
                                        key={alert.alertId}
                                        className={`p-4 transition-colors hover:bg-neutral-900/80 ${
                                            index !== alerts.length - 1
                                                ? "border-b border-neutral-800"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div className="min-w-0">
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <SeverityBadge
                                                        severity={alert.severity}
                                                    />

                                                    <span className="font-mono text-[11px] text-neutral-500">
                                                        RISK {alert.riskScore}
                                                    </span>

                                                    <span className="font-mono text-[11px] text-neutral-600">
                                                        {alert.hostId}
                                                    </span>
                                                </div>

                                                <p className="truncate text-sm font-medium text-neutral-200">
                                                    {alert.title}
                                                </p>

                                                <p className="mt-1 line-clamp-1 text-xs text-neutral-500">
                                                    {alert.description}
                                                </p>
                                            </div>

                                            <time className="shrink-0 font-mono text-[10px] text-neutral-600">
                                                {new Date(
                                                    alert.createdAt
                                                ).toLocaleString()}
                                            </time>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </BentoGridItem>

                    {/* Runtime information */}

                    <BentoGridItem
                        title="Runtime Architecture"
                        className="md:col-span-2"
                    >
                        <p className="font-mono text-sm leading-7 text-neutral-300">
                            Rust Agent &gt; Kafka &gt; Spring Boot &gt;
                            PostgreSQL &gt; SSE &gt; React
                        </p>

                        <p className="mt-3 text-xs leading-5 text-neutral-500">
                            Endpoint collection remains lightweight while
                            event transport, persistence, interpretation,
                            and presentation remain independently scalable.
                        </p>
                    </BentoGridItem>

                    <BentoGridItem title="Latest Event">
                        <p className="mt-2 font-mono text-sm text-neutral-300">
                            {lastEventAt
                                ? new Date(lastEventAt).toLocaleTimeString()
                                : latestAlert
                                    ? new Date(
                                        latestAlert.createdAt
                                    ).toLocaleTimeString()
                                    : "--:--:--"}
                        </p>

                        <p className="mt-2 text-xs text-neutral-600">
                            SSE delivery
                        </p>
                    </BentoGridItem>
                </BentoGrid>
            </div>
        </main>
    )
}

function Metric({
                    value,
                    label,
                }: {
    value: number | string
    label: string
}) {
    return (
        <div>
            <p className="text-4xl font-semibold tracking-tight">
                {value}
            </p>

            <p className="mt-2 text-xs text-neutral-500">
                {label}
            </p>
        </div>
    )
}

function PipelineNode({
                          label,
                      }: {
    label: string
}) {
    return (
        <span className="rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-neutral-300">
            {label}
        </span>
    )
}

function PipelineArrow() {
    return (
        <span className="text-neutral-700">
            &gt;
        </span>
    )
}

function HealthRow({
                       label,
                       status,
                   }: {
    label: string
    status?: string
}) {
    const healthy = status === "UP"

    return (
        <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">
                {label}
            </span>

            <div className="flex items-center gap-2">
                <span
                    className={`h-2 w-2 rounded-full ${
                        status == null
                            ? "bg-neutral-600"
                            : healthy
                                ? "bg-emerald-400"
                                : "bg-red-400"
                    }`}
                />

                <span className="font-mono text-xs text-neutral-300">
                    {status ?? "CHECKING"}
                </span>
            </div>
        </div>
    )
}

function StreamIndicator({
                             status,
                         }: {
    status: StreamStatus
}) {
    const label =
        status === "live"
            ? "Live Stream"
            : status === "connecting"
                ? "Connecting"
                : "Reconnecting"

    return (
        <div className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/70 px-4 py-2 text-sm">
            <span
                className={`h-2 w-2 rounded-full ${
                    status === "live"
                        ? "bg-emerald-400"
                        : "bg-amber-400"
                }`}
            />

            <span
                className={
                    status === "live"
                        ? "text-emerald-300"
                        : "text-amber-300"
                }
            >
                {label}
            </span>
        </div>
    )
}

function SeverityBadge({
                           severity,
                       }: {
    severity: string
}) {
    const classes =
        severity === "CRITICAL"
            ? "border-red-800 bg-red-950/60 text-red-300"
            : severity === "HIGH"
                ? "border-orange-900 bg-orange-950/50 text-orange-300"
                : severity === "MEDIUM"
                    ? "border-amber-900 bg-amber-950/40 text-amber-300"
                    : "border-neutral-700 bg-neutral-900 text-neutral-300"

    return (
        <span
            className={`rounded-md border px-2 py-1 text-xs font-medium ${classes}`}
        >
            {severity}
        </span>
    )
}
