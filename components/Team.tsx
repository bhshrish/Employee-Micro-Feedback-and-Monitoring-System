"use client";
import { useEffect, useState } from "react";
import { getTeamData, type TeamData } from "@/lib/api";
import { AppShell } from "./AppShell";
import { EmptyState, Skeleton } from "./UI";
import { Heatmap, Sparkline } from "./Charts";
import { Icon } from "./Icon";
import { useToast } from "./Toast";

function TeamContent() {
  const [data, setData] = useState<TeamData | null>(null); const [dismissed, setDismissed] = useState<number[]>([]); const [acknowledged, setAcknowledged] = useState<number[]>([]);
  const toast = useToast();
  useEffect(() => { getTeamData().then(setData); }, []);
  const visibleAlerts = data?.alerts.filter((alert) => !dismissed.includes(alert.id)) || [];
  return <div className="team-page"><div className="app-page-heading"><div><p className="section-label">Manager view</p><h1>Team pulse</h1><p>Aggregated wellbeing signals to help you support your teams sooner.</p></div><div className="privacy-banner"><Icon name="shield"/><span><strong>Anonymous by design</strong>Minimum 5 responses per group</span></div></div>{!data ? <div className="loading-grid"><Skeleton lines={5}/><Skeleton lines={5}/></div> : <>
    <section className="scorecard-grid">{data.teams.filter((team) => team.responses >= 5).map((team) => <article className="scorecard" key={team.name}><div className="scorecard-head"><div><h2>{team.name}</h2><span>{team.responses} anonymous responses</span></div><Sparkline data={team.trend}/></div><div className="scorecard-metrics"><div><span>Average mood</span><strong>{team.mood.toFixed(1)}<small>/5</small></strong></div><div><span>Stress</span><strong>{team.stress.toFixed(1)}<small>/5</small></strong></div><div><span>Workload</span><strong>{team.workload.toFixed(1)}<small>/5</small></strong></div></div><div className="participation"><span>Participation</span><strong>{team.participation}%</strong><div><i style={{ width: `${team.participation}%` }}/></div></div></article>)}</section>
    <div className="minimum-note"><Icon name="lock"/><p><strong>Operations is hidden.</strong> Only 4 responses were submitted this week. PULSE never shows groups below 5 responses.</p></div>
    <div className="team-grid"><section className="data-card span-2"><div className="card-heading"><div><p className="section-label">Six-week view</p><h2>Burnout-risk heatmap</h2></div><span className="subtle-label">Higher stress + workload</span></div><Heatmap/><div className="heat-legend"><span><i className="heat-0"/>Low</span><span><i className="heat-1"/>Mild</span><span><i className="heat-2"/>Watch</span><span><i className="heat-3"/>High</span></div></section><section className="alerts-panel"><div className="card-heading"><div><p className="section-label">Early signals</p><h2>Alerts</h2></div><span className="alert-count">{visibleAlerts.length}</span></div>{visibleAlerts.length === 0 ? <EmptyState title="You’re all caught up" text="Dismissed alerts are removed from this demo view."/> : visibleAlerts.map((alert) => <article className={`alert-card ${acknowledged.includes(alert.id) ? "acknowledged" : ""}`} key={alert.id}><div className="alert-top"><span className={`severity severity-${alert.severity.toLowerCase()}`}>{alert.severity}</span><time>{alert.time}</time></div><h3>{alert.title}</h3><p>{alert.detail}</p><div className="alert-actions"><button onClick={() => { setAcknowledged((items) => [...items, alert.id]); toast("Alert acknowledged."); }} disabled={acknowledged.includes(alert.id)}><Icon name="check" size={18}/>{acknowledged.includes(alert.id) ? "Acknowledged" : "Acknowledge"}</button><button onClick={() => setDismissed((items) => [...items, alert.id])}>Dismiss</button></div></article>)}</section></div>
    <section className="manager-note"><Icon name="users" size={30}/><div><h2>Turn signals into conversations.</h2><p>Use these trends to ask better questions—not to evaluate individuals. PULSE never exposes personal pulse comments or individual activity to managers.</p></div></section>
  </>}</div>;
}
export function Team() { return <AppShell><TeamContent/></AppShell>; }
