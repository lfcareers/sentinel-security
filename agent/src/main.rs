mod media;
mod telemetry;

use std::path::Path;

use media::detector::detect_media_type;
use media::hashing::sha256_file;
use security_events::{EventEnvelope, MediaScanRequest};
use telemetry::process::collect_processes;
use uuid::Uuid;

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

        println!("{}", serde_json::to_string_pretty(&event)?);
    }

    let test_media_path = Path::new(
        r"C:\Users\Logan Foster\OneDrive\Documents\SpringBoot\sentinel-security\test-media\sample.png"
    );

    if test_media_path.exists() {
        if let Some(media_type) = detect_media_type(test_media_path) {
            let hash = sha256_file(test_media_path)?;
            let metadata = std::fs::metadata(test_media_path)?;

            let request = MediaScanRequest {
                scan_id: Uuid::new_v4(),

                file_name: test_media_path
                    .file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_string(),

                file_path: test_media_path
                    .to_string_lossy()
                    .to_string(),

                sha256: hash,
                media_type,
                file_size_bytes: metadata.len(),
            };

            let event = EventEnvelope::new(
                "media.scan.request",
                "sentinel-agent",
                get_hostname(),
                request,
            );

            println!("{}", serde_json::to_string_pretty(&event)?);
        }
    } else {
        tracing::warn!(
            path = %test_media_path.display(),
            "Test media file not found"
        );
    }

    tracing::info!("Security telemetry generation complete");

    Ok(())
}

fn get_hostname() -> String {
    std::env::var("COMPUTERNAME")
        .or_else(|_| std::env::var("HOSTNAME"))
        .unwrap_or_else(|_| "unknown-host".to_string())
}