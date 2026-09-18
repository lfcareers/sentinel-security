use security_events::ProcessEvent;
use sysinfo::{Pid, System};

pub fn collect_processes() -> Vec<ProcessEvent> {
    let mut system = System::new_all();
    system.refresh_all();

    system
        .processes()
        .iter()
        .map(|(pid, process)| {
            let parent_process_id = process.parent().map(Pid::as_u32);

            let parent_executable_name = process
                .parent()
                .and_then(|parent_pid| system.process(parent_pid))
                .map(|parent| parent.name().to_string_lossy().to_string());

            ProcessEvent {
                process_id: pid.as_u32(),
                parent_process_id,
                parent_executable_name,
                executable_name: process.name().to_string_lossy().to_string(),
                executable_path: process.exe().map(|path| path.to_string_lossy().to_string()),
                cpu_usage: Some(process.cpu_usage()),
                memory_bytes: Some(process.memory()),
            }
        })
        .collect()
}
