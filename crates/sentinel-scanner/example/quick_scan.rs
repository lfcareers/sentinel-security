use sentinel_scanner::run_quick_scan;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let report = run_quick_scan(10);

    println!("{}", serde_json::to_string_pretty(&report)?);

    Ok(())
}