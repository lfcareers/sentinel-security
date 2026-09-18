mod process;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub use process::collect_processes;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanReport {
    pub scan_id: Uuid,
    pub started_at: DateTime<Utc>,
    pub completed_at: DateTime<Utc>,
    pub observations: Vec<Observation>,
    pub findings: Vec<Finding>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Observation {
    pub category: String,
    pub summary: String,
    pub observed_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Finding {
    pub rule_id: String,
    pub title: String,
    pub severity: Severity,
    pub confidence: Confidence,
    pub reason: String,
    pub recommended_action: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Severity {
    Informational,
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Confidence {
    Low,
    Medium,
    High,
}

pub fn run_quick_scan(limit: usize) -> ScanReport {
    let started_at = Utc::now();
    let processes = collect_processes();

    let observations = processes
        .iter()
        .take(limit)
        .map(|process| Observation {
            category: "process".to_string(),
            summary: format!("{} (PID {})", process.executable_name, process.process_id),
            observed_at: Utc::now(),
        })
        .collect();

    let findings = processes
        .iter()
        .filter_map(|process| {
            let path = process.executable_path.as_deref()?;
            let normalized_path = path.to_ascii_lowercase();

            let suspicious_location = normalized_path.contains("\\temp\\")
                || normalized_path.contains("\\downloads\\")
                || normalized_path.contains("/tmp/");

            suspicious_location.then(|| Finding {
                rule_id: "SEN-PROC-001".to_string(),
                title: "Process launched from a review location".to_string(),
                severity: Severity::Medium,
                confidence: Confidence::Medium,
                reason: format!(
                    "{} is running from a temporary or download directory.",
                    process.executable_name
                ),
                recommended_action: "Confirm that you intentionally opened this application."
                    .to_string(),
            })
        })
        .take(limit)
        .collect();

    ScanReport {
        scan_id: Uuid::new_v4(),
        started_at,
        completed_at: Utc::now(),
        observations,
        findings,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn quick_scan_returns_a_completed_report() {
        let report = run_quick_scan(10);

        assert_eq!(report.observations.len(), 10);
        assert!(report.completed_at >= report.started_at);
    }
}
