import { useEffect, useMemo, useState } from "react"
import { getAlerts } from "@/api/alerts"
import type { SecurityAlert } from "@/types/security"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import SentinelNavbar from "@/components/SentinelNavbar"

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

export default function Overview() {
    const [alerts, setAlerts] = useState<SecurityAlert[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [streamStatus, setStreamStatus] =
        useState<StreamStatus>("connecting")
    const [lastEventAt, setLastEventAt] = useState<string | null>(null)

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

        eventSource.addEventListener(
            "security-alert",
            (event: MessageEvent<string>) => {
                try {
                    const liveEvent: LiveSecurityEvent =
                        JSON.parse(event.data)

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
                            (existing) =>
                                existing.alertId !== alert.alertId
                        )

                        return [alert, ...withoutDuplicate]
                    })

                    setLastEventAt(liveEvent.timestamp)
                    setStreamStatus("live")
                } catch (err) {
                    console.error(
                        "Failed to parse Sentinel SSE event:",
                        err
                    )
                }
            }
        )

        eventSource.onerror = () => {
            setStreamStatus("disconnected")
        }

        return () => {
            eventSource.close()
        }
    }, [])

    const highestRisk = useMemo(() => {
        if (alerts.length === 0) return 0

        return Math.max(
            ...alerts.map((alert) => alert.riskScore)
        )
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

    const uniqueHosts = useMemo(
        () =>
            new Set(
                alerts.map((alert) => alert.hostId)
            ).size,
        [alerts]
    )

    const latestAlert = alerts[0]

    if (loading) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white">
                <SentinelNavbar />

                <div className="mx-auto max-w-7xl p-6">
                    Establishing Sentinel telemetry pipeline...
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white">
                <SentinelNavbar />

                <div className="mx-auto max-w-7xl p-6">
                    <div className="rounded-xl border border-red-900 bg-red-950/40 p-4">
                        {error}
                    </div>
                </div>
            </main>
        )
    }

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

                <BentoGrid className="mx-auto max-w-7xl">

                    {/* Primary telemetry inspector */}

                    <BentoGridItem
                        title="Live Telemetry Inspector"
                        className="md:col-span-3"
                    >
                        {latestAlert ? (
                            <div className="grid gap-0 overflow-hidden rounded-xl border border-neutral-800 lg:grid-cols-2">

                                {/* Raw side */}

                                <div className="min-w-0 border-b border-neutral-800 bg-black/30 lg:border-b-0 lg:border-r">
                                    <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                                                Raw Event
                                            </p>

                                            <p className="mt-1 font-mono text-[10px] text-neutral-600">
                                                security.alert.generated
                                            </p>
                                        </div>

                                        <span className="font-mono text-[10px] text-emerald-400">
                                            KAFKA
                                        </span>
                                    </div>

                                    <div className="overflow-x-auto p-5">
                                        <RawEvent alert={latestAlert} />
                                    </div>
                                </div>

                                {/* Human-readable side */}

                                <div className="bg-neutral-900/30 p-5">
                                    <div className="mb-5 flex items-center justify-between">
                                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                                            Interpreted Detection
                                        </p>

                                        <SeverityBadge
                                            severity={latestAlert.severity}
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-end gap-2">
                                            <span className="text-5xl font-semibold tracking-tight">
                                                {latestAlert.riskScore}
                                            </span>

                                            <span className="pb-1 text-sm text-neutral-600">
                                                / 100 risk
                                            </span>
                                        </div>
                                    </div>

                                    <h2 className="text-xl font-medium text-neutral-100">
                                        {latestAlert.title}
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-neutral-400">
                                        {latestAlert.description}
                                    </p>

                                    <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-neutral-800 pt-5 text-sm">
                                        <TelemetryField
                                            label="Endpoint"
                                            value={latestAlert.hostId}
                                        />

                                        <TelemetryField
                                            label="Process"
                                            value={
                                                latestAlert.processId?.toString() ??
                                                "stream event"
                                            }
                                        />

                                        <TelemetryField
                                            label="Rule"
                                            value={latestAlert.ruleId}
                                        />

                                        <TelemetryField
                                            label="Action"
                                            value={latestAlert.action}
                                        />
                                    </dl>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-neutral-800 p-8 text-sm text-neutral-500">
                                Waiting for endpoint telemetry.
                            </div>
                        )}
                    </BentoGridItem>

                    {/* KPI cards */}

                    <BentoGridItem title="Risk">
                        <Metric
                            value={highestRisk}
                            label="highest observed"
                        />
                    </BentoGridItem>

                    <BentoGridItem title="Detections">
                        <Metric
                            value={alerts.length}
                            label="persisted events"
                        />
                    </BentoGridItem>

                    <BentoGridItem title="Endpoints">
                        <Metric
                            value={uniqueHosts}
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
                            value={highSeverityCount}
                            label="high / critical"
                        />
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

function RawEvent({
                      alert,
                  }: {
    alert: SecurityAlert
}) {
    return (
        <pre className="font-mono text-xs leading-6">
            <span className="text-neutral-600">{"{"}</span>
            {"\n  "}
            <JsonKey>host_id</JsonKey>
            <JsonSeparator />
            <JsonString value={alert.hostId} />
            <JsonComma />

            {"\n  "}
            <JsonKey>process_id</JsonKey>
            <JsonSeparator />
            <JsonNumber value={alert.processId ?? "null"} />
            <JsonComma />

            {"\n  "}
            <JsonKey>risk_score</JsonKey>
            <JsonSeparator />
            <JsonNumber value={alert.riskScore} />
            <JsonComma />

            {"\n  "}
            <JsonKey>severity</JsonKey>
            <JsonSeparator />
            <JsonString value={alert.severity} />
            <JsonComma />

            {"\n  "}
            <JsonKey>rule_id</JsonKey>
            <JsonSeparator />
            <JsonString value={alert.ruleId} />
            <JsonComma />

            {"\n  "}
            <JsonKey>action</JsonKey>
            <JsonSeparator />
            <JsonString value={alert.action} />
            <JsonComma />

            {"\n  "}
            <JsonKey>timestamp</JsonKey>
            <JsonSeparator />
            <JsonString value={alert.createdAt} />

            {"\n"}
            <span className="text-neutral-600">{"}"}</span>
        </pre>
    )
}

function JsonKey({
                     children,
                 }: {
    children: string
}) {
    return (
        <span className="text-sky-300">
            "{children}"
        </span>
    )
}

function JsonSeparator() {
    return <span className="text-neutral-600">: </span>
}

function JsonString({
                        value,
                    }: {
    value: string
}) {
    return (
        <span className="text-emerald-300">
            "{value}"
        </span>
    )
}

function JsonNumber({
                        value,
                    }: {
    value: number | string
}) {
    return (
        <span className="text-amber-300">
            {value}
        </span>
    )
}

function JsonComma() {
    return <span className="text-neutral-600">,</span>
}

function Metric({
                    value,
                    label,
                }: {
    value: number
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

function TelemetryField({
                            label,
                            value,
                        }: {
    label: string
    value: string
}) {
    return (
        <div className="min-w-0">
            <dt className="text-[10px] uppercase tracking-[0.16em] text-neutral-600">
                {label}
            </dt>

            <dd className="mt-1 truncate font-mono text-xs text-neutral-300">
                {value}
            </dd>
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