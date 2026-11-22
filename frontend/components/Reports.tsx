"use client";
import { useCallback, useEffect, useState } from "react";
import { downloadReport, getReportSummary } from "@/lib/api";
import { AppShell } from "./AppShell";
import { ReportPreview } from "./ReportPreview";
import { Icon } from "./Icon";
import { Skeleton } from "./UI";
import { useToast } from "./Toast";

const metricOptions = ["Active time", "Productivity", "Idle time", "Burnout risk"] as const;
type ReportMetric = (typeof metricOptions)[number];
type ReportPeriod = "Today" | "Last 7 days" | "Last 30 days" | "Last quarter";
type ReportFormat = "PDF" | "CSV";

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

function downloadFile(content: BlobPart, name: string, type: string) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
}

function ReportsContent() {
    const [period, setPeriod] = useState<ReportPeriod>("Last 30 days");
    const [metrics, setMetrics] = useState<ReportMetric[]>(["Productivity", "Burnout risk"]);
    const [format, setFormat] = useState<ReportFormat>("PDF");
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [error, setError] = useState("");
    const [downloading, setDownloading] = useState(false);
    const toast = useToast();

    const load = useCallback(() => {
        let active = true;
        getReportSummary(period, metrics).then((result) => {
            if (active)
                setSummary(result as unknown as ReportSummary);
        }).catch((cause) => {
            if (active)
                setError(cause instanceof Error ? cause.message : "Could not load report data.");
        });
        return () => { active = false; };
    }, [period, metrics]);

    useEffect(() => load(), [load]);

    const generate = async (): Promise<void> => {
        setDownloading(true);
        setError("");
        try {
            const report = await downloadReport(period, metrics, format);
            downloadFile(report.blob, report.filename, report.blob.type);
            toast(`${format} report downloaded.`);
        }
        catch (cause) {
            const message = cause instanceof Error ? cause.message : "Could not generate the report.";
            setError(message);
            toast(message);
        }
        finally {
            setDownloading(false);
        }
    };

    return <>
        <div className="reports-page">
            <div className="app-page-heading">
                <div>
                    <p className="section-label">Report builder</p>
                    <h1>Make the pattern clear.</h1>
                    <p>Build a report from submitted wellbeing forms and productivity data.</p>
                </div>
                <span className="access-chip"><Icon name="shield" size={18}/>Free report download</span>
            </div>
            <div className="report-layout">
                <section className="report-builder">
                    <h2>Report settings</h2>
                    <label>Period<select value={period} onChange={(event) => {
                        setSummary(null);
                        setError("");
                        setPeriod(event.target.value as ReportPeriod);
                    }}><option>Today</option><option>Last 7 days</option><option>Last 30 days</option><option>Last quarter</option></select></label>
                    <fieldset>
                        <legend>Metrics</legend>
                        <div className="check-list">{metricOptions.map((metric) => <label key={metric}><input type="checkbox" checked={metrics.includes(metric)} onChange={() => {
                            setSummary(null);
                            setError("");
                            setMetrics((items) => items.includes(metric) ? items.filter((item) => item !== metric) : [...items, metric]);
                        }}/><span>{metric}</span></label>)}</div>
                    </fieldset>
                    <fieldset>
                        <legend>Download format</legend>
                        <div className="segmented">{(["PDF", "CSV"] as const).map((item) => <button type="button" key={item} className={format === item ? "active" : ""} onClick={() => setFormat(item)} aria-pressed={format === item}>{item}</button>)}</div>
                    </fieldset>
                    <button className="button button-full" onClick={() => void generate()} disabled={!metrics.length || downloading}>
                        {downloading ? <><span className="spinner"/>Generating…</> : <>Generate and download {format}<Icon name="arrow"/></>}
                    </button>
                    <p className="form-note"><Icon name="shield" size={17}/>Reports are free. Small groups are suppressed.</p>
                </section>
                <div>{!summary && !error ? <Skeleton lines={7}/> : error ? <p role="alert">{error}</p> : summary ? <ReportPreview summary={summary} locked={false}/> : null}</div>
            </div>
        </div>
    </>;
}

export function Reports() {
    return <AppShell><ReportsContent /></AppShell>;
}
