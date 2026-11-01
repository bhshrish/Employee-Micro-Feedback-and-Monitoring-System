"use client";
import { useCallback, useEffect, useState } from "react";
import { downloadReport, getReportSummary } from "@/lib/api";
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
function ReportsContent() {
  const [period, setPeriod] = useState("Last 30 days"); const [metrics, setMetrics] = useState(["Active time","Productivity","Team pulse"]); const [format, setFormat] = useState<"PDF" | "CSV">("PDF");
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getReportSummary>> | null>(null); const [error, setError] = useState(""); const [paywall, setPaywall] = useState(false); const [downloading, setDownloading] = useState(false);
  const { canDownloadReports } = useSubscription(); const toast = useToast();
  const load = useCallback(() => {
    let active = true;
    setSummary(null);
    setError("");
    getReportSummary(period, metrics).then((result) => { if (active) setSummary(result); }).catch((cause: unknown) => {
      if (!active) return;
      const message = cause instanceof Error ? cause.message : "Could not load report data.";
      setError(message);
      if (cause instanceof Error && "status" in cause && cause.status === 402) setPaywall(true);
    });
    return () => { active = false; };
  }, [period, metrics]);
  useEffect(() => load(), [load]);
  const download = async () => {
    if (!canDownloadReports) { setPaywall(true); return; }
    setDownloading(true);
    try {
      const result = await downloadReport(period, metrics, format);
      downloadFile(result.blob, result.filename, result.blob.type);
      toast(`${format} report downloaded.`);
    } catch (cause) {
      toast(cause instanceof Error ? cause.message : "Could not generate the report.");
    } finally { setDownloading(false); }
  };
  return <div className="reports-page"><div className="app-page-heading"><div><p className="section-label">Report builder</p><h1>Make the pattern clear.</h1><p>Build a report from activity and anonymous team data in your workspace.</p></div><span className={`access-chip ${canDownloadReports ? "paid" : ""}`}><Icon name={canDownloadReports ? "check" : "lock"} size={18}/>{canDownloadReports ? "Exports unlocked" : "Plan required"}</span></div><div className="report-layout"><section className="report-builder"><h2>Report settings</h2><label>Period<select value={period} onChange={(e) => setPeriod(e.target.value)}><option>Today</option><option>Last 7 days</option><option>Last 30 days</option><option>Last quarter</option></select></label><fieldset><legend>Metrics</legend><div className="check-list">{metricOptions.map((metric) => <label key={metric}><input type="checkbox" checked={metrics.includes(metric)} onChange={() => setMetrics((items) => items.includes(metric) ? items.filter((item) => item !== metric) : [...items, metric])}/><span>{metric}</span></label>)}</div></fieldset><fieldset><legend>Download format</legend><div className="segmented">{(["PDF","CSV"] as const).map((item) => <button type="button" key={item} className={format === item ? "active" : ""} onClick={() => setFormat(item)} aria-pressed={format === item}>{item}</button>)}</div></fieldset><div className="report-builder-actions">{!canDownloadReports && <button className="button button-outline button-full" onClick={() => setPaywall(true)}>View plans</button>}<button className="button button-full" onClick={download} disabled={!metrics.length || downloading}>{downloading ? "Generating…" : <><Icon name={canDownloadReports ? "download" : "lock"}/>Download {format}</>}</button></div><p className="form-note"><Icon name="shield" size={17}/>Reports are generated from workspace records with small-group data suppressed.</p></section><div>{!summary && !error ? <Skeleton lines={7}/> : error ? <p role="alert">{error}</p> : summary ? <ReportPreview summary={summary} locked={!canDownloadReports}/> : null}</div></div><PaywallModal open={paywall} onClose={() => setPaywall(false)}/></div>;
}
export function Reports() { return <AppShell><ReportsContent/></AppShell>; }
