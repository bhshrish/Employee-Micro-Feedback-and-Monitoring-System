"use client";
import Script from "next/script";
import { useCallback, useEffect, useState } from "react";
import { createReportOrder, downloadReport, getReportSummary } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { AppShell } from "./AppShell";
import { ReportPreview } from "./ReportPreview";
import { Icon } from "./Icon";
import { Skeleton } from "./UI";
import { useToast } from "./Toast";

const metricOptions = ["Active time", "Productivity", "Idle time", "Burnout risk"];

function downloadFile(content, name, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
}

function ReportsContent() {
    const [period, setPeriod] = useState("Last 30 days");
    const [metrics, setMetrics] = useState(["Productivity", "Burnout risk"]);
    const [format, setFormat] = useState("PDF");
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState("");
    const [paymentError, setPaymentError] = useState("");
    const [sdkReady, setSdkReady] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const { user } = useSubscription();
    const toast = useToast();

    const load = useCallback(() => {
        let active = true;
        setSummary(null);
        setError("");
        getReportSummary(period, metrics).then((result) => {
            if (active)
                setSummary(result);
        }).catch((cause) => {
            if (active)
                setError(cause instanceof Error ? cause.message : "Could not load report data.");
        });
        return () => { active = false; };
    }, [period, metrics]);

    useEffect(() => load(), [load]);

    const generate = async () => {
        if (!sdkReady || !window.Razorpay) {
            setPaymentError("Secure checkout is still loading. Please try again shortly.");
            return;
        }
        setDownloading(true);
        setPaymentError("");
        try {
            const checkout = await createReportOrder(period, metrics, format);
            const razorpay = new window.Razorpay({
                key: checkout.keyId,
                amount: checkout.order.amount,
                currency: checkout.order.currency,
                name: "CalmWork",
                description: "Generate one report",
                order_id: checkout.order.id,
                prefill: { email: user?.email || "" },
                theme: { color: "#315c50" },
                handler: async (payment) => {
                    try {
                        const report = await downloadReport(period, metrics, format, {
                            orderId: payment.razorpay_order_id,
                            paymentId: payment.razorpay_payment_id,
                            signature: payment.razorpay_signature,
                        });
                        downloadFile(report.blob, report.filename, report.blob.type);
                        toast(`${format} report generated.`);
                    }
                    catch (cause) {
                        const message = cause instanceof Error ? cause.message : "Could not generate the report.";
                        setPaymentError(message);
                        toast(message);
                    }
                    finally {
                        setDownloading(false);
                    }
                },
                modal: {
                    ondismiss: () => setDownloading(false),
                },
            });
            razorpay.open();
        }
        catch (cause) {
            const message = cause instanceof Error ? cause.message : "Could not start secure checkout.";
            setPaymentError(message);
            setDownloading(false);
        }
    };

    return <>
        <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="afterInteractive"
            onReady={() => setSdkReady(true)}
            onError={() => setPaymentError("Secure checkout could not be loaded. Please refresh and try again.")}
        />
        <div className="reports-page">
            <div className="app-page-heading">
                <div>
                    <p className="section-label">Report builder</p>
                    <h1>Make the pattern clear.</h1>
                    <p>Build a report from submitted wellbeing forms and productivity data.</p>
                </div>
                <span className="access-chip"><Icon name="lock" size={18}/>₹99 per report</span>
            </div>
            <div className="report-layout">
                <section className="report-builder">
                    <h2>Report settings</h2>
                    <label>Period<select value={period} onChange={(event) => setPeriod(event.target.value)}><option>Today</option><option>Last 7 days</option><option>Last 30 days</option><option>Last quarter</option></select></label>
                    <fieldset>
                        <legend>Metrics</legend>
                        <div className="check-list">{metricOptions.map((metric) => <label key={metric}><input type="checkbox" checked={metrics.includes(metric)} onChange={() => setMetrics((items) => items.includes(metric) ? items.filter((item) => item !== metric) : [...items, metric])}/><span>{metric}</span></label>)}</div>
                    </fieldset>
                    <fieldset>
                        <legend>Download format</legend>
                        <div className="segmented">{["PDF", "CSV"].map((item) => <button type="button" key={item} className={format === item ? "active" : ""} onClick={() => setFormat(item)} aria-pressed={format === item}>{item}</button>)}</div>
                    </fieldset>
                    {paymentError && <p className="field-error" role="alert">{paymentError}</p>}
                    <button className="button button-full" onClick={() => void generate()} disabled={!metrics.length || downloading}>
                        {downloading ? <><span className="spinner"/>Processing payment…</> : <>Pay ₹99 and generate {format}<Icon name="arrow"/></>}
                    </button>
                    <p className="form-note"><Icon name="shield" size={17}/>Payment is verified before the report is generated. Small groups are suppressed.</p>
                </section>
                <div>{!summary && !error ? <Skeleton lines={7}/> : error ? <p role="alert">{error}</p> : summary ? <ReportPreview summary={summary} locked={false}/> : null}</div>
            </div>
        </div>
    </>;
}

export function Reports() {
    return <AppShell><ReportsContent /></AppShell>;
}
