use std::path::Path;

use security_events::MediaScanRequest;
use uuid::Uuid;
use walkdir::WalkDir;

use super::detector::detect_media_type;
use super::hashing::sha256_file;

pub fn scan_directory(root: &Path) -> Vec<MediaScanRequest> {
    let mut requests = Vec::new();

    for entry in WalkDir::new(root)
        .follow_links(false)
        .into_iter()
        .filter_map(Result::ok)
    {
        let path = entry.path();

        if !path.is_file() {
            continue;
        }

        let Some(media_type) = detect_media_type(path) else {
            continue;
        };

        let Ok(metadata) = std::fs::metadata(path) else {
            continue;
        };

        let Ok(hash) = sha256_file(path) else {
            continue;
        };

        let request = MediaScanRequest {
            scan_id: Uuid::new_v4(),

            file_name: path
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string(),

            file_path: path
                .to_string_lossy()
                .to_string(),

            sha256: hash,

            media_type,

            file_size_bytes: metadata.len(),
        };

        requests.push(request);
    }

    requests
}