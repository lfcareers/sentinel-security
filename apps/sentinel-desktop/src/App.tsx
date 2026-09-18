import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

type Observation = {
    category: string;
    summary: string;
    observed_at: string;
};

type Finding = {
    rule_id: string;
    title: string;
    severity: "informational" | "low" | "medium" | "high";
    confidence: "low" | "medium" | "high";
    reason: string;
    recommended_action: string;
};

type ScanReport = {
    scan_id: string;
    started_at: string;
    completed_at: string;
    observations: Observation[];
    findings: Finding[];
};

function App() {
    const [report, setReport] = useState<ScanReport | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function runScan() {
        setIsScanning(true);
        setError(null);

        try {
            const result = await invoke<ScanReport>("run_quick_scan");
            setReport(result);
        } catch (scanError) {
            setError(String(scanError));
        } finally {
            setIsScanning(false);
        }
    }

    const duration =
        report === null
            ? null
            : new Date(report.completed_at).getTime() -
            new Date(report.started_at).getTime();

    return (
        <main className="app-shell">
            <header className="hero">
                <div>
                    <p className="eyebrow">SENTINEL SECURITY</p>
                    <h1>Local Endpoint Protection</h1>
                    <p className="subtitle">
                        Inspect active Windows processes with a privacy-first Rust scanner.
                    </p>
                </div>

                <div className="protection-status">
                    <span className="status-dot" />
                    Local protection ready
                </div>
            </header>

            <section className="scan-panel">
                <div>
                    <p className="section-label">QUICK SCAN</p>
                    <h2>Review current process activity</h2>
                    <p>
                        The scan executes on this computer. No scan information is uploaded.
                    </p>
                </div>

                <button
                    className="scan-button"
                    disabled={isScanning}
                    onClick={runScan}
                >
                    {isScanning ? "Scanning…" : "Run Quick Scan"}
                </button>
            </section>

            {error && (
                <section className="error-panel">
                    <strong>Scan failed</strong>
                    <p>{error}</p>
                </section>
            )}

            {report && (
                <>
                    <section className="summary-grid">
                        <article className="summary-card">
                            <span>Processes reviewed</span>
                            <strong>{report.observations.length}</strong>
                        </article>

                        <article className="summary-card">
                            <span>Findings</span>
                            <strong>{report.findings.length}</strong>
                        </article>

                        <article className="summary-card">
                            <span>Scan duration</span>
                            <strong>{duration} ms</strong>
                        </article>
                    </section>

                    <section className="results-grid">
                        <article className="result-panel">
                            <div className="panel-heading">
                                <div>
                                    <p className="section-label">OBSERVATIONS</p>
                                    <h2>Active processes</h2>
                                </div>
                                <span>{report.observations.length} reviewed</span>
                            </div>

                            <div className="result-list">
                                {report.observations.map((observation, index) => (
                                    <div
                                        className="observation-row"
                                        key={`${observation.summary}-${index}`}
                                    >
                                        <span className="process-icon">P</span>
                                        <div>
                                            <strong>{observation.summary}</strong>
                                            <small>{observation.category}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="result-panel">
                            <div className="panel-heading">
                                <div>
                                    <p className="section-label">FINDINGS</p>
                                    <h2>Items requiring review</h2>
                                </div>
                            </div>

                            {report.findings.length === 0 ? (
                                <div className="empty-state">
                                    <span className="success-mark">✓</span>
                                    <h3>No concerns found</h3>
                                    <p>
                                        None of the reviewed processes matched the current
                                        detection rules.
                                    </p>
                                </div>
                            ) : (
                                <div className="result-list">
                                    {report.findings.map((finding) => (
                                        <div className="finding-card" key={finding.rule_id}>
                      <span className={`severity ${finding.severity}`}>
                        {finding.severity}
                      </span>
                                            <h3>{finding.title}</h3>
                                            <p>{finding.reason}</p>
                                            <small>{finding.recommended_action}</small>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </article>
                    </section>

                    <footer className="report-footer">
                        <span>Scan ID: {report.scan_id}</span>
                        <span>Processed locally by Sentinel Rust</span>
                    </footer>
                </>
            )}
        </main>
    );
}

export default App;