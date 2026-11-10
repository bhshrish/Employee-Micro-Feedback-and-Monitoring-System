"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getReportSummary } from "@/lib/api";
import { AppShell } from "./AppShell";
import { Skeleton } from "./UI";
import { Icon } from "./Icon";
import { useSubscription } from "@/lib/subscription";
import { useTimer } from "@/hooks/useTimer";
import { TimerControl } from "./TimerControl";

const periods = [
    { label: "Last 7 days", value: "7d" },
    { label: "Last 30 days", value: "30d" },
    { label: "Last quarter", value: "quarter" },
];
const metrics = ["Active time", "Idle time", "Productivity", "Team pulse", "Burnout risk"];

function formatGeneratedAt(value) {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function MonitoringContent() {
    const { status, trialDaysLeft, user } = useSubscription();
    const { keypressCounting, keypressCount, setKeypressCounting } = useTimer();
    const canViewTeamSummary = user?.role === "admin" || user?.role === "manager";
    const [period, setPeriod] = useState(periods[0].value);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [requiresPlan, setRequiresPlan] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!canViewTeamSummary) {
            setLoading(false);
            return;
        }
        let active = true;
        setLoading(true);
        setSummary(null);
        setError("");
        setRequiresPlan(false);
        getReportSummary(period, metrics).then((result) => {
            if (active)
                setSummary(result);
        }).catch((cause) => {
            if (active) {
                setError(cause instanceof Error ? cause.message : "Could not load monitoring data.");
                setRequiresPlan(cause instanceof Error && "status" in cause && cause.status === 402);
            }
        }).finally(() => {
            if (active)
                setLoading(false);
        });
        return () => { active = false; };
    }, [period, refreshKey, canViewTeamSummary]);

    const refresh = () => setRefreshKey((key) => key + 1);
    const periodLabel = periods.find((item) => item.value === period)?.label || "Selected period";
    const productivity = Math.min(100, Math.max(0, summary?.productivity ?? 0));

    return <div className="monitoring-page" data-no-auto-track>
      <div className="app-page-heading">
        <div>
          <p className="section-label">{canViewTeamSummary ? "Workspace oversight" : "Your work session"}</p>
          <h1>Monitoring</h1>
          <p>{canViewTeamSummary ? "Start or pause your own work tracking, and review privacy-safe workspace or team summaries." : "Choose when to track your own work session and whether to count keypresses locally."}</p>
        </div>
        {canViewTeamSummary && <div className="monitoring-controls">
          <label htmlFor="monitoring-period">Reporting period</label>
          <select id="monitoring-period" value={period} onChange={(event) => setPeriod(event.target.value)}>
            {periods.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
          </select>
          <button type="button" className="button button-outline" onClick={refresh} disabled={loading}>
            <Icon name="pulse" size={18}/>{loading ? "Updating…" : "Refresh"}
          </button>
        </div>}
      </div>

      <section className="employee-monitoring" aria-labelledby="employee-monitoring-title">
        <div className="monitoring-summary-head">
          <div>
            <p className="section-label">Employee-controlled</p>
            <h2 id="employee-monitoring-title">Your work activity</h2>
          </div>
        </div>
        <TimerControl startLabel="Start monitoring"/>
        <section className="monitoring-privacy" aria-label="Optional keypress count controls">
          <Icon name="shield" size={25}/>
          <div>
            <strong>Optional keypress counts</strong>
            <p>When enabled, WellTrack counts keydown events only while your work session is running and this tab is visible. It does not inspect, save, or send key values, typed characters, or text. The count stays in this browser, is not shared with managers, and is erased when you stop or turn counting off.</p>
            <label className="keypress-consent">
              <input type="checkbox" checked={keypressCounting} onChange={(event) => setKeypressCounting(event.target.checked)}/>
              <span>Enable keypress counting</span>
            </label>
            <p className="keypress-count" role="status">Current session keypress count: <strong>{keypressCount.toLocaleString()}</strong></p>
          </div>
        </section>
      </section>

      <section className="monitoring-privacy" aria-label="Monitoring privacy commitment">
        <Icon name="shield" size={25}/>
        <div>
          <strong>{canViewTeamSummary ? "Team summaries remain aggregated" : "You control your work-session tracking"}</strong>
          <p>{canViewTeamSummary ? "Managers see workspace or team summaries, not employee-level activity timelines. Keypress counts are optional, local to each employee's browser, and never shared. WellTrack does not record screen content or typed text." : "WellTrack does not record screen content or typed text. You can pause or stop your activity session and turn keypress counting off at any time."}</p>
        </div>
      </section>
      {canViewTeamSummary && status === "trialing" && <p className="form-note" role="status">
        Monitoring is included in your 7-day free trial ({trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} remaining). Choose a monthly or yearly plan to keep access after the trial.
      </p>}

      {canViewTeamSummary && loading && !summary ? <div className="loading-grid"><Skeleton lines={5}/><Skeleton lines={5}/></div> : null}
      {canViewTeamSummary && error ? <section className="monitoring-error" role="alert">
        <div className="monitoring-error-card">
          <Icon name={requiresPlan ? "lock" : "alert"} size={28}/>
          <div><h2>{requiresPlan ? "Monitoring requires an active plan" : "Monitoring data unavailable"}</h2><p>{error}</p></div>
          {requiresPlan ? <Link className="button button-outline" href="/pricing">View plans</Link> : <button className="button button-outline" onClick={refresh}>Try again</button>}
        </div>
      </section> : null}

      {canViewTeamSummary && summary ? <>
        <div className="monitoring-summary-head">
          <div>
            <p className="section-label">{periodLabel}</p>
            <h2>Work patterns at a glance</h2>
          </div>
          <span>Updated {formatGeneratedAt(summary.generatedAt)}</span>
        </div>
        <section className="kpi-grid monitoring-kpis" aria-label="Aggregated monitoring metrics" aria-busy={loading}>
          <article className="kpi-card"><div className="kpi-label"><Icon name="clock" size={20}/><span>Active time</span></div><strong>{summary.activeHours}h</strong><p>Aggregate across eligible contributors</p></article>
          <article className="kpi-card"><div className="kpi-label"><Icon name="clock" size={20}/><span>Idle time</span></div><strong>{summary.idleHours}h</strong><p>Stored separately from active time</p></article>
          <article className="kpi-card"><div className="kpi-label"><Icon name="chart" size={20}/><span>Productive activity</span></div><strong>{productivity}%</strong><p>Share of reported active time</p></article>
          <article className="kpi-card"><div className="kpi-label"><Icon name="users" size={20}/><span>Teams</span></div><strong>{summary.teams}</strong><p>Teams represented in this workspace</p></article>
          <article className="kpi-card"><div className="kpi-label"><Icon name="pulse" size={20}/><span>Anonymous pulse responses</span></div><strong>{summary.pulseParticipationResponses}</strong><p>Responses in groups meeting the privacy minimum</p></article>
          <article className="kpi-card"><div className="kpi-label"><Icon name="alert" size={20}/><span>Teams to check in with</span></div><strong>{summary.riskTeams}</strong><p>Aggregate wellbeing signals—not individual assessments</p></article>
        </section>

        <div className="monitoring-detail-grid">
          <section className="data-card monitoring-productivity">
            <div className="card-heading">
              <div><p className="section-label">Activity mix</p><h2>Productive share</h2></div>
              <span className="monitoring-period-chip">{periodLabel}</span>
            </div>
            <div className="monitoring-meter" role="img" aria-label={`${productivity}% of active time tagged productive`}>
              <span style={{ width: `${productivity}%` }}/>
            </div>
            <div className="monitoring-meter-labels"><span>0%</span><strong>{productivity}% productive</strong><span>100%</span></div>
            <p className="monitoring-note">Activity totals appear only when enough distinct contributors are represented. A zero can mean no activity was recorded or small-group totals were suppressed.</p>
          </section>
          <section className="data-card monitoring-coverage">
            <p className="section-label">Signals in this view</p>
            <h2>What managers can see</h2>
            <ul>
              <li><Icon name="check"/>Aggregate active and idle time</li>
              <li><Icon name="check"/>Overall productive share of active time</li>
              <li><Icon name="check"/>Anonymous pulse signals by eligible group</li>
              <li><Icon name="close"/>No individual employee activity timeline</li>
              <li><Icon name="close"/>No screen recordings, typed text, or individual keypress counts</li>
            </ul>
            <Link href="/team" className="button button-outline">View team wellbeing <Icon name="arrow" size={18}/></Link>
          </section>
        </div>
      </> : null}
    </div>;
}

export function Monitoring() {
    return <AppShell><MonitoringContent /></AppShell>;
}
