type ProductHeroProps = {
    downloadUrl: string
    releaseNotesUrl: string
}

export default function ProductHero({
                                        downloadUrl,
                                        releaseNotesUrl,
                                    }: ProductHeroProps) {
    return (
        <section
            id="downloads"
            className="relative mb-8 overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950"
        >
            {/* Aceternity-inspired background treatment */}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_90%_70%,rgba(34,211,238,0.08),transparent_30%)]"
            />

            <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
            />

            <div className="relative grid gap-10 px-6 py-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-10 lg:py-12">
                <div>
                    <div className="mb-5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                            Windows release available
                        </span>

                        <span className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                            Version 0.1.0
                        </span>
                    </div>

                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
                        Sentinel Security
                    </p>

                    <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                        Conduct security scans with Sentinel.
                    </h1>

                    <p className="mt-5 max-w-xl text-base leading-7 text-neutral-400">
                        Review active Windows processes with a fast,
                        privacy-first endpoint scanner powered by Rust.
                        Scan information remains locally on your device.
                    </p>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <a
                            href={downloadUrl}
                            className="group inline-flex h-12 items-center justify-between gap-8 rounded-lg border border-emerald-300/40 bg-emerald-400 px-5 text-sm font-semibold text-neutral-950 shadow-[0_0_30px_rgba(52,211,153,0.18)] transition hover:-translate-y-0.5 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-neutral-950"
                        >
                            <span>Download Sentinel</span>

                            <span className="font-mono text-[10px] uppercase tracking-[0.16em] transition group-hover:translate-y-0.5">
                                Windows .EXE ↓
                            </span>
                        </a>

                        <a
                            href={releaseNotesUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-12 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900/70 px-5 text-sm font-medium text-neutral-300 transition hover:border-neutral-500 hover:bg-neutral-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
                        >
                            Release notes ↗
                        </a>
                    </div>

                    <div className="mt-7 grid max-w-lg grid-cols-3 gap-2">
                        <ProductFact label="Runtime" value="Rust" />
                        <ProductFact label="Platform" value="Windows x64" />
                        <ProductFact label="Data" value="Local only" />
                    </div>
                </div>

                <div className="relative">
                    <div
                        aria-hidden="true"
                        className="absolute -inset-8 rounded-full bg-emerald-500/10 blur-3xl"
                    />

                    <div className="relative overflow-hidden rounded-2xl border border-neutral-700/80 bg-neutral-900 p-2 shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
                        <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-2">
                            <div className="flex gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                            </div>

                            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-600">
                                Sentinel desktop
                            </span>
                        </div>

                        <img
                            src="/sentinel-desktop-preview.png"
                            alt="Sentinel Security desktop application showing completed local scan results"
                            className="aspect-[16/10] w-full rounded-b-xl object-cover object-top"
                        />
                    </div>

                    <div className="absolute -bottom-4 left-5 rounded-lg border border-emerald-500/20 bg-neutral-950/95 px-3 py-2 shadow-xl backdrop-blur">
                        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-500">
                            Processing boundary
                        </p>

                        <p className="mt-1 text-xs font-medium text-emerald-300">
                            Scan completed locally
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

function ProductFact({
                         label,
                         value,
                     }: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-lg border border-neutral-800 bg-black/20 px-3 py-2.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-600">
                {label}
            </p>

            <p className="mt-1 text-xs font-medium text-neutral-300">
                {value}
            </p>
        </div>
    )
}