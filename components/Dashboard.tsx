"use client";
import { useEffect, useState } from "react";
import { getDashboardData, type DashboardData } from "@/lib/api";
import { AppShell } from "./AppShell";
import { TimerControl } from "./TimerControl";
import { PulseForm } from "./PulseForm";
import { KpiCard, Skeleton } from "./UI";
import { SvgBarChart, SvgDonut, SvgLine, WeeklyStacked } from "./Charts";

function DashboardContent() {
  const [range, setRange] = useState<"Today" | "7d" | "30d">("Today");
  const [data, setData] = useState<DashboardData | null>(null);
  useEffect(() => { let live = true; setData(null); getDashboardData(range).then((next) => { if (live) setData(next); }); return () => { live = false; }; }, [range]);
  return <div className="dashboard-page"><div className="app-page-heading"><div><p className="section-label">Wednesday, October 28</p><h1>Good morning, Alex.</h1><p>A clear view of your time and energy—just for you.</p></div><div className="range-switcher" role="group" aria-label="Dashboard date range">{(["Today","7d","30d"] as const).map((item) => <button key={item} className={range === item ? "active" : ""} onClick={() => setRange(item)} aria-pressed={range === item}>{item}</button>)}</div></div>
    <TimerControl/>
    {!data ? <div className="loading-grid"><Skeleton lines={4}/><Skeleton lines={4}/><Skeleton lines={4}/></div> : <>
      <section className="kpi-grid" aria-label="Daily key performance indicators"><KpiCard label="Total tracked today" value={data.kpis.total} note="Across 6 work blocks" icon="clock"/><KpiCard label="Active time" value={data.kpis.active} note="91% of tracked time" icon="pulse"/><KpiCard label="Idle time" value={data.kpis.idle} note="Stored separately" icon="clock"/><KpiCard label="Productive" value={`${data.kpis.productive}%`} note="+4% from yesterday" icon="spark"/><KpiCard label="Weekly total" value={data.kpis.weekly} note="On pace for 39h" icon="chart"/><KpiCard label="Current streak" value={`${data.kpis.streak} days`} note="Personal best: 18" icon="users"/></section>
      <div className="dashboard-grid"><section className="data-card span-2 daily-activity"><div className="card-heading"><div><p className="section-label">Today</p><h2>Activity timeline</h2></div><div className="chart-legend"><span><i className="legend-active"/>Active</span><span><i className="legend-idle"/>Idle</span></div></div><SvgBarChart data={data.daily}/></section><PulseForm/>
      <section className="data-card span-2 weekly-activity"><div className="card-heading"><div><p className="section-label">This week</p><h2>Where your time went</h2></div><div className="chart-legend"><span><i className="legend-active"/>Productive</span><span><i className="legend-neutral"/>Neutral</span><span><i className="legend-idle"/>Idle</span></div></div><WeeklyStacked data={data.weekly}/></section><section className="data-card donut-card"><div className="card-heading"><div><p className="section-label">Focus</p><h2>Productive vs. idle</h2></div></div><SvgDonut productive={data.kpis.productive}/><div className="donut-details"><p><span>Productive work</span><strong>5h 22m</strong></p><p><span>Neutral & distracting</span><strong>38m</strong></p><p><span>Idle</span><strong>{data.kpis.idle}</strong></p></div></section>
      <section className="data-card span-3 trend-card"><div className="card-heading"><div><p className="section-label">Four-week trend</p><h2>Your productive rhythm</h2></div><span className="trend-chip">↑ 12% this month</span></div><SvgLine data={data.trend}/></section></div></>}
  </div>;
}
export function Dashboard() { return <AppShell><DashboardContent/></AppShell>; }
