export default function SentinelNavbar() {
    return (
        <nav className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
                <a href="/" className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <div>
                        <p className="text-sm font-semibold tracking-tight text-white">
                            Sentinel Security
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                            Endpoint Telemetry Platform
                        </p>
                    </div>
                </a>

                <div className="flex items-center gap-4 text-sm">
                    <a
                        href="/#overview"
                        className="hidden text-neutral-400 transition hover:text-white sm:inline"
                    >
                        Overview
                    </a>
                    <a
                        href="/#architecture"
                        className="hidden text-neutral-400 transition hover:text-white sm:inline"
                    >
                        Architecture
                    </a>
                    <a
                        href="https://loganfoster.net"
                        className="hidden text-neutral-400 transition hover:text-white md:inline"
                    >
                        LoganFoster.net ↗
                    </a>
                    <a
                        href="/sign-in"
                        className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 font-medium text-emerald-300 transition hover:bg-emerald-500/20 hover:text-white"
                    >
                        Sign in
                    </a>
                </div>
            </div>
        </nav>
    )
}