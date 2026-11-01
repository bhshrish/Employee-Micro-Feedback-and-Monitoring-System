"use client";
import { useEffect, useState } from "react";
import { getDashboardData, type DashboardData } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { AppShell } from "./AppShell";
import { TimerControl } from "./TimerControl";
import { PulseForm } from "./PulseForm";
import { EmptyState, KpiCard, Skeleton } from "./UI";
import { SvgBarChart, SvgDonut, SvgLine, WeeklyStacked } from "./Charts";

function DashboardContent() {
  const [range, setRange] = useState<"Today" | "7d" | "30d">("Today");
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const { user } = useSubscription();

  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    getDashboardData(range).then((next) => {
      if (active) setData(next);
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Could not load your activity data.");
    });
    return () => { active = false; };
  }, [range]);

  const today = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.name.trim().split(/\s+/)[0] || "there";
  const trackedSeconds = data ? Number.parseFloat(data.kpis.total) * 3600 : 0;
  const activeSeconds = data ? Number.parseFloat(data.kpis.active) * 3600 : 0;
  const activeShare = trackedSeconds ? Math.round(activeSeconds / trackedSeconds * 100) : 0;

  return <div className="dashboard-page">
    <div className="app-page-heading">
      <div><p className="section-label">{today}</p><h1>{greeting}, {firstName}.</h1><p>A clear view of your time and energy—just for you.</p></div>
      <div className="range-switcher" role="group" aria-label="Dashboard date range">{(["Today", "7d", "30d"] as const).map((item) => <button key={item} className={range === item ? "active" : ""} onClick={() => setRange(item)} aria-pressed={range === item}>{item}</button>)}</div>
    </div>
    <TimerControl/>
    {!data && !error ? <div className="loading-grid"><Skeleton lines={4}/><Skeleton lines={4}/><Skeleton lines={4}/></div> : null}
    {error ? <EmptyState title="Activity data unavailable" text={error}/> : null}
    {data ? <>
      <section className="kpi-grid" aria-label="Activity key performance indicators">
        <KpiCard label={`Total tracked (${range})`} value={data.kpis.total} note={`Across ${data.sessions} recorded sessions`} icon="clock"/>
        <KpiCard label="Active time" value={data.kpis.active} note={`${activeShare}% of tracked time`} icon="pulse"/>
        <KpiCard label="Idle time" value={data.kpis.idle} note="Stored separately" icon="clock"/>
        <KpiCard label="Productive" value={`${data.kpis.productive}%`} note="Of active tracked time" icon="spark"/>
        <KpiCard label="Last 7 days" value={data.kpis.weekly} note="Recorded activity" icon="chart"/>
        <KpiCard label="Current streak" value={`${data.kpis.streak} days`} note="Consecutive days with recorded activity" icon="users"/>
      </section>
      <div className="dashboard-grid">
        <section className="data-card span-2 daily-activity"><div className="card-heading"><div><p className="section-label">{range === "Today" ? "Today" : range === "7d" ? "Last 7 days" : "Last 30 days"}</p><h2>Activity timeline</h2></div><div className="chart-legend"><span><i className="legend-active"/>Active</span><span><i className="legend-idle"/>Idle</span></div></div><SvgBarChart data={data.daily}/></section>
        <PulseForm/>
        <section className="data-card span-2 weekly-activity"><div className="card-heading"><div><p className="section-label">Last 7 days</p><h2>Where your time went</h2></div><div className="chart-legend"><span><i className="legend-active"/>Productive</span><span><i className="legend-neutral"/>Neutral</span><span><i className="legend-idle"/>Idle</span></div></div><WeeklyStacked data={data.weekly}/></section>
        <section className="data-card donut-card"><div className="card-heading"><div><p className="section-label">Focus</p><h2>Productive vs. other</h2></div></div><SvgDonut productive={data.kpis.productive}/><div className="donut-details"><p><span>Productive work</span><strong>{data.productiveHours.toFixed(1)}h</strong></p><p><span>Other active time</span><strong>{data.neutralHours.toFixed(1)}h</strong></p><p><span>Idle</span><strong>{data.kpis.idle}</strong></p></div></section>
        <section className="data-card span-3 trend-card"><div className="card-heading"><div><p className="section-label">Recent activity</p><h2>Your productive rhythm</h2></div></div><SvgLine data={data.trend} label="Recent daily productivity percentages"/></section>
      </div>
    </> : null}
  </div>;
}
export function Dashboard() { return <AppShell><DashboardContent/></AppShell>; }
