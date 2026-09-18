use sentinel_scanner::{run_quick_scan as scan, ScanReport};

#[tauri::command]
fn run_quick_scan() -> ScanReport {
    scan(10)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![run_quick_scan])
        .run(tauri::generate_context!())
        .expect("error while running Sentinel");
}
