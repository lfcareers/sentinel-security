export default function LiveIndicator() {
    return (
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>

            Live telemetry
        </div>
    );
}