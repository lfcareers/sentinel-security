use chrono::Utc;
use security_events::{ProcessEvent, ResponseAction, SecurityAlert, Severity};
use uuid::Uuid;

pub fn evaluate_process(
    source_event_id: Uuid,
    host_id: &str,
    process: &ProcessEvent,
) -> Vec<SecurityAlert> {
    let mut alerts = Vec::new();

    if let Some(alert) = detect_system_binary_path_anomaly(source_event_id, host_id, process) {
        alerts.push(alert);
    }

    if let Some(alert) = detect_suspicious_shell_location(source_event_id, host_id, process) {
        alerts.push(alert);
    }

    alerts
}

fn detect_system_binary_path_anomaly(
    source_event_id: Uuid,
    host_id: &str,
    process: &ProcessEvent,
) -> Option<SecurityAlert> {
    let name = process.executable_name.to_ascii_lowercase();

    let protected_names = [
        "svchost.exe",
        "services.exe",
        "lsass.exe",
        "winlogon.exe",
        "csrss.exe",
    ];

    if !protected_names.contains(&name.as_str()) {
        return None;
    }

    let path = process.executable_path.as_ref()?;
    let normalized_path = path.to_ascii_lowercase();

    if normalized_path.starts_with(r"c:\windows\system32")
        || normalized_path.starts_with(r"c:\windows\syswow64")
    {
        return None;
    }

    Some(SecurityAlert {
        alert_id: Uuid::new_v4(),
        source_event_id,

        rule_id: "SYSTEM_BINARY_PATH_ANOMALY".into(),

        title: "System binary running from unusual location".into(),

        description: format!(
            "{} is running from unexpected path: {}",
            process.executable_name, path
        ),

        risk_score: 85,
        severity: Severity::High,

        host_id: host_id.to_string(),
        process_id: Some(process.process_id),

        action: ResponseAction::Alert,

        timestamp: Utc::now(),
    })
}

fn detect_suspicious_shell_location(
    source_event_id: Uuid,
    host_id: &str,
    process: &ProcessEvent,
) -> Option<SecurityAlert> {
    let name = process.executable_name.to_ascii_lowercase();

    let shells = [
        "powershell.exe",
        "pwsh.exe",
        "cmd.exe",
        "wscript.exe",
        "cscript.exe",
    ];

    if !shells.contains(&name.as_str()) {
        return None;
    }

    let path = process.executable_path.as_ref()?;
    let normalized_path = path.to_ascii_lowercase();

    let suspicious_locations = [r"\temp\", r"\downloads\", r"\appdata\local\temp\"];

    if !suspicious_locations
        .iter()
        .any(|location| normalized_path.contains(location))
    {
        return None;
    }

    Some(SecurityAlert {
        alert_id: Uuid::new_v4(),
        source_event_id,

        rule_id: "SUSPICIOUS_SHELL_LOCATION".into(),

        title: "Shell executable running from suspicious location".into(),

        description: format!("{} detected at {}", process.executable_name, path),

        risk_score: 70,
        severity: Severity::High,

        host_id: host_id.to_string(),
        process_id: Some(process.process_id),

        action: ResponseAction::Alert,

        timestamp: Utc::now(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detects_system_binary_path_anomaly() {
        let process = ProcessEvent {
            process_id: 99999,
            parent_process_id: Some(1234),

            executable_name: "svchost.exe".to_string(),

            executable_path: Some(r"C:\Users\Public\Temp\svchost.exe".to_string()),

            cpu_usage: Some(1.0),
            memory_bytes: Some(10_000_000),
        };

        let alerts = evaluate_process(Uuid::new_v4(), "TEST-HOST", &process);

        assert_eq!(alerts.len(), 1);
        assert_eq!(alerts[0].rule_id, "SYSTEM_BINARY_PATH_ANOMALY");
        assert_eq!(alerts[0].risk_score, 85);
    }

    #[test]
    fn ignores_legitimate_system_binary_path() {
        let process = ProcessEvent {
            process_id: 1234,
            parent_process_id: Some(100),

            executable_name: "svchost.exe".to_string(),

            executable_path: Some(r"C:\Windows\System32\svchost.exe".to_string()),

            cpu_usage: Some(0.0),
            memory_bytes: Some(20_000_000),
        };

        let alerts = evaluate_process(Uuid::new_v4(), "TEST-HOST", &process);

        assert!(alerts.is_empty());
    }

    #[test]
    fn detects_shell_from_temp_directory() {
        let process = ProcessEvent {
            process_id: 5678,
            parent_process_id: Some(1000),

            executable_name: "powershell.exe".to_string(),

            executable_path: Some(r"C:\Users\Test\AppData\Local\Temp\powershell.exe".to_string()),

            cpu_usage: Some(1.0),
            memory_bytes: Some(15_000_000),
        };

        let alerts = evaluate_process(Uuid::new_v4(), "TEST-HOST", &process);

        assert_eq!(alerts.len(), 1);
        assert_eq!(alerts[0].rule_id, "SUSPICIOUS_SHELL_LOCATION");
        assert_eq!(alerts[0].risk_score, 70);
    }
}
