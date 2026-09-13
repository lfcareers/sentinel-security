mod kafka;
mod media;
mod telemetry;

use std::path::Path;

use kafka::producer::KafkaProducer;
use media::scanner::scan_directory;
use security_events::EventEnvelope;
use telemetry::process::collect_processes;

fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_target(false)
        .compact()
        .init();

    tracing::info!("Sentinel Security Agent starting");

    let kafka = KafkaProducer::new("localhost:9092")?;

    tracing::info!("Kafka producer initialized");

    // -------------------------------------------------
    // PROCESS TELEMETRY
    // -------------------------------------------------

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

        let json = serde_json::to_string(&event)?;

        kafka.publish(
            "security.endpoint.process",
            &event.event_id.to_string(),
            &json,
        )?;

        println!("{}", serde_json::to_string_pretty(&event)?);
    }

    // -------------------------------------------------
    // RECURSIVE MEDIA SCAN
    // -------------------------------------------------

    let scan_root = Path::new(
        r"C:\Users\Logan Foster\OneDrive\Documents\SpringBoot\sentinel-security\test-media",
    );

    if scan_root.exists() {
        tracing::info!(
            path = %scan_root.display(),
            "Starting recursive media scan"
        );

        let media_requests = scan_directory(scan_root);

        tracing::info!(
            media_count = media_requests.len(),
            "Recursive media scan complete"
        );

        for request in media_requests {
            let event = EventEnvelope::new(
                "media.scan.request",
                "sentinel-agent",
                get_hostname(),
                request,
            );

            let json = serde_json::to_string(&event)?;

            kafka.publish(
                "security.media.scan.request",
                &event.event_id.to_string(),
                &json,
            )?;

            println!("{}", serde_json::to_string_pretty(&event)?);
        }
    } else {
        tracing::warn!(
            path = %scan_root.display(),
            "Media scan directory does not exist"
        );
    }

    // -------------------------------------------------
    // CONTROLLED DETECTION TEST
    // -------------------------------------------------

    tracing::info!("Security telemetry generation complete");

    Ok(())
}
fn get_hostname() -> String {
    std::env::var("COMPUTERNAME")
        .or_else(|_| std::env::var("HOSTNAME"))
        .unwrap_or_else(|_| "unknown-host".to_string())
}
