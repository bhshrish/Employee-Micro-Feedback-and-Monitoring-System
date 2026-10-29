"use client";
import { useCallback, useEffect, useState } from "react";
import { getReportSummary } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { AppShell } from "./AppShell";
import { ReportPreview } from "./ReportPreview";
import { PaywallModal } from "./PaywallModal";
import { Icon } from "./Icon";
import { Skeleton } from "./UI";
import { useToast } from "./Toast";

const metricOptions = ["Active time", "Productivity", "Idle time", "Team pulse", "Burnout risk"];
function downloadFile(content: BlobPart, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type })); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}
function makePdf(lines: string[]) {
  const safe = (s: string) => s.replace(/([()\\])/g, "\\$1");
  const stream = `BT /F1 22 Tf 50 790 Td (${safe(lines[0])}) Tj /F1 12 Tf ${lines.slice(1).map((line) => `0 -30 Td (${safe(line)}) Tj`).join(" ")} ET`;
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  let pdf = "%PDF-1.4\n"; const offsets = [0];
  objects.forEach((obj,i) => { offsets.push(pdf.length); pdf += `${i+1} 0 obj\n${obj}\nendobj\n`; });
  const xref = pdf.length; pdf += `xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map((o) => `${String(o).padStart(10,"0")} 00000 n \n`).join("")}trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

function ReportsContent() {
  const [period, setPeriod] = useState("Last 30 days"); const [metrics, setMetrics] = useState(["Active time","Productivity","Team pulse"]); const [format, setFormat] = useState<"PDF" | "CSV">("PDF");
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getReportSummary>> | null>(null); const [paywall, setPaywall] = useState(false); const [downloading, setDownloading] = useState(false);
  const { canDownloadReports } = useSubscription(); const toast = useToast();
  const load = useCallback(() => { setSummary(null); getReportSummary(period, metrics).then(setSummary); }, [period, metrics]);
  useEffect(() => { load(); }, [load]);
  const download = async () => {
    if (!canDownloadReports) { setPaywall(true); return; }
    setDownloading(true); const data = summary || await getReportSummary(period, metrics);
    if (format === "CSV") downloadFile(`Metric,Value\nPeriod,${period}\nActive hours,${data.activeHours}\nProductivity,${data.productivity}%\nPulse participation,${data.pulseParticipation}%\nTeams at risk,${data.riskTeams}\n`, "pulse-report.csv", "text/csv");
    else downloadFile(makePdf(["PULSE Report", `Period: ${period}`, `Active time: ${data.activeHours} hours`, `Productivity: ${data.productivity}%`, `Pulse participation: ${data.pulseParticipation}%`, `Teams at risk: ${data.riskTeams}`, "Demo report generated locally in your browser."]), "pulse-report.pdf", "application/pdf");
    setDownloading(false); toast(`${format} report downloaded.`);
  };
  return <div className="reports-page"><div className="app-page-heading"><div><p className="section-label">Report builder</p><h1>Make the pattern clear.</h1><p>Build a concise activity and wellbeing report, generated entirely in your browser.</p></div><span className={`access-chip ${canDownloadReports ? "paid" : ""}`}><Icon name={canDownloadReports ? "check" : "lock"} size={18}/>{canDownloadReports ? "Exports unlocked" : "Trial preview"}</span></div><div className="report-layout"><section className="report-builder"><h2>Report settings</h2><label>Period<select value={period} onChange={(e) => setPeriod(e.target.value)}><option>Today</option><option>Last 7 days</option><option>Last 30 days</option><option>Last quarter</option></select></label><fieldset><legend>Metrics</legend><div className="check-list">{metricOptions.map((metric) => <label key={metric}><input type="checkbox" checked={metrics.includes(metric)} onChange={() => setMetrics((items) => items.includes(metric) ? items.filter((item) => item !== metric) : [...items, metric])}/><span>{metric}</span></label>)}</div></fieldset><fieldset><legend>Download format</legend><div className="segmented">{(["PDF","CSV"] as const).map((item) => <button type="button" key={item} className={format === item ? "active" : ""} onClick={() => setFormat(item)} aria-pressed={format === item}>{item}</button>)}</div></fieldset><div className="report-builder-actions">{!canDownloadReports && <button className="button button-outline button-full" onClick={() => setPaywall(true)}>Unlock with a plan</button>}<button className="button button-full" onClick={download} disabled={!metrics.length || downloading}>{downloading ? "Generating…" : <><Icon name={canDownloadReports ? "download" : "lock"}/>Download {format}</>}</button></div><p className="form-note"><Icon name="shield" size={17}/>No files or report data leave your browser.</p></section><div>{!summary ? <Skeleton lines={7}/> : <ReportPreview summary={summary} locked={!canDownloadReports}/>}</div></div><PaywallModal open={paywall} onClose={() => setPaywall(false)}/></div>;
}
export function Reports() { return <AppShell><ReportsContent/></AppShell>; }
