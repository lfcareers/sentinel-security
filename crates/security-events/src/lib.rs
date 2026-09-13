use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventEnvelope<T> {
    pub event_id: Uuid,
    pub event_type: String,
    pub schema_version: u16,
    pub source: String,
    pub host_id: String,
    pub timestamp: DateTime<Utc>,
    pub payload: T,
}

impl<T> EventEnvelope<T> {
    pub fn new(
        event_type: impl Into<String>,
        source: impl Into<String>,
        host_id: impl Into<String>,
        payload: T,
    ) -> Self {
        Self {
            event_id: Uuid::new_v4(),
            event_type: event_type.into(),
            schema_version: 1,
            source: source.into(),
            host_id: host_id.into(),
            timestamp: Utc::now(),
            payload,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum Severity {
    Info,
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessEvent {
    pub process_id: u32,
    pub parent_process_id: Option<u32>,
    pub executable_name: String,
    pub executable_path: Option<String>,
    pub cpu_usage: Option<f32>,
    pub memory_bytes: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum MediaType {
    Image,
    Video,
    Audio,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaScanRequest {
    pub scan_id: Uuid,
    pub file_name: String,
    pub file_path: String,
    pub sha256: String,
    pub media_type: MediaType,
    pub file_size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionSignal {
    pub signal_type: String,
    pub confidence: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaScanResult {
    pub scan_id: Uuid,
    pub sha256: String,
    pub synthetic_probability: f32,
    pub severity: Severity,
    pub model_name: String,
    pub model_version: String,
    pub signals: Vec<DetectionSignal>,
    pub processing_time_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ResponseAction {
    Monitor,
    Alert,
    Review,
    Block,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityAlert {
    pub alert_id: Uuid,
    pub source_event_id: Uuid,
    pub rule_id: String,
    pub title: String,
    pub description: String,
    pub risk_score: u8,
    pub severity: Severity,
    pub host_id: String,
    pub process_id: Option<u32>,
    pub action: ResponseAction,
    pub timestamp: DateTime<Utc>,
}
