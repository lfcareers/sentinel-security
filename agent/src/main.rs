mod telemetry;

use security_events::EventEnvelope;
use telemetry::process::collect_processes;

fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_target(false)
        .compact()
        .init();

    tracing::info!("Sentinel Security Agent starting");

    let processes = collect_processes();

    tracing::info!(
        process_count = processes.len(),
        "Windows process telemetry collected"
    );

    for process in processes.iter().take(10) {
        let event = EventEnvelope::new(
            "endpoint.process.observed",
            "sentinel-agent",
            get_hostname(),
            process.clone(),
        );

        let json = serde_json::to_string_pretty(&event)?;

        println!("{json}");
    }

    tracing::info!("Security telemetry generation complete");

    Ok(())
}

fn get_hostname() -> String {
    std::env::var("COMPUTERNAME")
        .or_else(|_| std::env::var("HOSTNAME"))
        .unwrap_or_else(|_| "unknown-host".to_string())
}