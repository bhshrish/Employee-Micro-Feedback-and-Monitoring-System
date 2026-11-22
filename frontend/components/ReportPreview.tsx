interface ReportSummary {
    period?: string;
    activeHours: number;
    productivity: number;
    pulseParticipationResponses: number;
    averageBurnoutScore: number | null;
    riskTeams: number;
    sessions: number;
    teams: number;
    idleHours: number;
    metrics: string[];
}

interface ReportPreviewProps {
    summary: ReportSummary | null;
    locked: boolean;
}

export function ReportPreview({ summary, locked }: ReportPreviewProps) {
    return <section className={`report-preview ${locked ? "locked" : ""}`} aria-label="Report preview"><div className="report-paper"><div className="report-paper-head"><div><span>CALMWORK / WELLBEING REPORT</span><h2>Wellbeing & activity summary</h2></div><strong>{summary?.period || "Selected period"}</strong></div><div className="report-summary-grid"><div><span>Active time</span><strong>{summary ? `${summary.activeHours}h` : "—"}</strong></div><div><span>Productivity</span><strong>{summary ? `${summary.productivity}%` : "—"}</strong></div><div><span>Check-in responses</span><strong>{summary?.pulseParticipationResponses ?? "—"}</strong></div><div><span>Average burnout signal</span><strong>{summary?.averageBurnoutScore == null ? "—" : `${summary.averageBurnoutScore}/100`}</strong></div><div><span>Teams needing support</span><strong>{summary?.riskTeams ?? "—"}</strong></div></div><div className="report-notes"><h3>Productivity summary</h3><p>{summary ? `${summary.sessions} completed sessions across ${summary.teams} teams; ${summary.idleHours} idle hours recorded.` : "No report data loaded."}</p><h3>Included metrics</h3><p>{summary?.metrics.join(" · ") || "None"}</p><p>Wellbeing data is aggregated and groups below the privacy threshold are suppressed. No individual responses are included.</p></div></div>{locked && <div className="preview-lock"><span>Free report download</span></div>}</section>;
}
