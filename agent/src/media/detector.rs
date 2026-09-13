use security_events::MediaType;
use std::path::Path;

pub fn detect_media_type(path: &Path) -> Option<MediaType> {
    let extension = path
        .extension()?
        .to_string_lossy()
        .to_ascii_lowercase();

    match extension.as_str() {
        "jpg" | "jpeg" | "png" => Some(MediaType::Image),
        "mp4" => Some(MediaType::Video),
        _ => None,
    }
}

pub fn is_supported_media(path: &Path) -> bool {
    detect_media_type(path).is_some()
}