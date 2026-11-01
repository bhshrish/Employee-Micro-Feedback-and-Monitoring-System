"use client";
import { useEffect, useState } from "react";
import { getTeamData, updateAlert, type TeamData } from "@/lib/api";
import { AppShell } from "./AppShell";
import { EmptyState, Skeleton } from "./UI";
import { Heatmap, Sparkline } from "./Charts";
import { Icon } from "./Icon";
import { useToast } from "./Toast";

function TeamContent() {
  const [data, setData] = useState<TeamData | null>(null); const [error, setError] = useState("");
  const toast = useToast();
  useEffect(() => {
    let active = true;
    getTeamData().then((result) => { if (active) setData(result); })
      .catch((cause: unknown) => {
        const message = cause instanceof Error ? cause.message : "Could not load team signals.";
        if (active) setError(message);
      });
    return () => { active = false; };
  }, []);
  const updateStatus = async (id: string, status: "acknowledged" | "dismissed") => {
    try {
      await updateAlert(id, status);
      setData((current) => current && ({
        ...current,
        alerts: status === "dismissed" ? current.alerts.filter((alert) => alert.id !== id) :
          current.alerts.map((alert) => alert.id === id ? { ...alert, status } : alert),
      }));
      toast(status === "acknowledged" ? "Alert acknowledged." : "Alert dismissed.");
    } catch (cause) {
      toast(cause instanceof Error ? cause.message : "Could not update the alert.");
    }
  };
  const visibleAlerts = data?.alerts || [];
  return <div className="team-page"><div className="app-page-heading"><div><p className="section-label">Manager view</p><h1>Team pulse</h1><p>Aggregated wellbeing signals to help you support your teams sooner.</p></div><div className="privacy-banner"><Icon name="shield"/><span><strong>Anonymous by design</strong>Minimum {data?.minimumGroupSize ?? 5} responses per group</span></div></div>{!data && !error ? <div className="loading-grid"><Skeleton lines={5}/><Skeleton lines={5}/></div> : error ? <EmptyState title="Team signals unavailable" text={error}/> : data ? <>
    <section className="scorecard-grid">{data.teams.map((team) => <article className="scorecard" key={team.id}><div className="scorecard-head"><div><h2>{team.name}</h2><span>{team.responses} anonymous responses</span></div><Sparkline data={team.trend}/></div><div className="scorecard-metrics"><div><span>Average mood</span><strong>{team.mood.toFixed(1)}<small>/5</small></strong></div><div><span>Stress</span><strong>{team.stress.toFixed(1)}<small>/5</small></strong></div><div><span>Workload</span><strong>{team.workload.toFixed(1)}<small>/5</small></strong></div></div><div className="participation"><span>Participation</span><strong>{team.participation}%</strong><div><i style={{ width: `${team.participation}%` }}/></div></div></article>)}</section>
    {data.suppressedTeams > 0 && <div className="minimum-note"><Icon name="lock"/><p><strong>{data.suppressedTeams} {data.suppressedTeams === 1 ? "team is" : "teams are"} hidden.</strong> Team data is shown only after at least {data.minimumGroupSize} responses. Individual responses are never exposed.</p></div>}
    <div className="team-grid"><section className="data-card span-2"><div className="card-heading"><div><p className="section-label">Six-week view</p><h2>Burnout-risk heatmap</h2></div><span className="subtle-label">Higher stress + workload</span></div><Heatmap data={data.heatmap}/><div className="heat-legend"><span><i className="heat-0"/>Low</span><span><i className="heat-1"/>Mild</span><span><i className="heat-2"/>Watch</span><span><i className="heat-3"/>High</span></div></section><section className="alerts-panel"><div className="card-heading"><div><p className="section-label">Early signals</p><h2>Alerts</h2></div><span className="alert-count">{visibleAlerts.length}</span></div>{visibleAlerts.length === 0 ? <EmptyState title="You’re all caught up" text="There are no open team alerts right now."/> : visibleAlerts.map((alert) => <article className={`alert-card ${alert.status === "acknowledged" ? "acknowledged" : ""}`} key={alert.id}><div className="alert-top"><span className={`severity severity-${alert.severity.toLowerCase()}`}>{alert.severity}</span><time>{alert.time}</time></div><h3>{alert.title}</h3><p>{alert.detail}</p><div className="alert-actions"><button onClick={() => void updateStatus(alert.id, "acknowledged")} disabled={alert.status === "acknowledged"}><Icon name="check" size={18}/>{alert.status === "acknowledged" ? "Acknowledged" : "Acknowledge"}</button><button onClick={() => void updateStatus(alert.id, "dismissed")}>Dismiss</button></div></article>)}</section></div>
    <section className="manager-note"><Icon name="users" size={30}/><div><h2>Turn signals into conversations.</h2><p>Use these trends to ask better questions—not to evaluate individuals. PULSE never exposes personal pulse comments or individual activity to managers.</p></div></section>
  </> : null}</div>;
}
export function Team() { return <AppShell><TeamContent/></AppShell>; }
