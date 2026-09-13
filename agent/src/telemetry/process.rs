use security_events::ProcessEvent;
use sysinfo::{Pid, System};

pub fn collect_processes() -> Vec<ProcessEvent> {
    let mut system = System::new_all();

    system.refresh_all();

    system
        .processes()
        .iter()
        .map(|(pid, process)| ProcessEvent {
            process_id: pid.as_u32(),

            parent_process_id: process.parent().map(Pid::as_u32),

            executable_name: process.name().to_string_lossy().to_string(),

            executable_path: process.exe().map(|path| path.to_string_lossy().to_string()),

            cpu_usage: Some(process.cpu_usage()),

            memory_bytes: Some(process.memory()),
        })
        .collect()
}
