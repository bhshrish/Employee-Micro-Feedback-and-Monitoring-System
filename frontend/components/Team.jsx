"use client";
import { useEffect, useRef, useState } from "react";
import { getHeatmapData, getTeamData, updateAlert } from "@/lib/api";
import { AppShell } from "./AppShell";
import { EmptyState, Skeleton } from "./UI";
import { Heatmap, Sparkline } from "./Charts";
import { Icon } from "./Icon";
import { useToast } from "./Toast";
function TeamContent() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [heatmapWeeks, setHeatmapWeeks] = useState(6);
    const [heatmapTeamId, setHeatmapTeamId] = useState("");
    const [heatmapLoading, setHeatmapLoading] = useState(false);
    const [heatmapError, setHeatmapError] = useState("");
    const [heatmapReady, setHeatmapReady] = useState(false);
    const heatmapInitialized = useRef(false);
    const toast = useToast();
    useEffect(() => {
        let active = true;
        getTeamData().then((result) => {
            if (active) {
                setData(result);
                setHeatmapReady(true);
            }
        })
            .catch((cause) => {
            const message = cause instanceof Error ? cause.message : "Could not load team signals.";
            if (active)
                setError(message);
        });
        return () => { active = false; };
    }, []);
    useEffect(() => {
        if (!heatmapReady)
            return;
        if (!heatmapInitialized.current) {
            heatmapInitialized.current = true;
            return;
        }
        let active = true;
        setHeatmapLoading(true);
        setHeatmapError("");
        getHeatmapData(heatmapWeeks, heatmapTeamId || undefined).then((result) => {
            if (active) {
                setData((current) => current && ({
                    ...current,
                    heatmap: result.cells,
                }));
            }
        }).catch((cause) => {
            if (active)
                setHeatmapError(cause instanceof Error ? cause.message : "Could not load heatmap data.");
        }).finally(() => {
            if (active)
                setHeatmapLoading(false);
        });
        return () => { active = false; };
    }, [heatmapWeeks, heatmapTeamId, heatmapReady]);
    const updateStatus = async (id, status) => {
        try {
            await updateAlert(id, status);
            setData((current) => current && ({
                ...current,
                alerts: status === "dismissed" ? current.alerts.filter((alert) => alert.id !== id) :
                    current.alerts.map((alert) => alert.id === id ? { ...alert, status } : alert),
            }));
            toast(status === "acknowledged" ? "Alert acknowledged." : "Alert dismissed.");
        }
        catch (cause) {
            toast(cause instanceof Error ? cause.message : "Could not update the alert.");
        }
    };
    const visibleAlerts = data?.alerts || [];
    const visibleHeatmapTeams = heatmapTeamId
        ? data?.heatmapTeams.filter((team) => team.id === heatmapTeamId) || []
        : data?.heatmapTeams || [];
    return <div className="team-page"><div className="app-page-heading"><div><p className="section-label">Manager view</p><h1>Team pulse</h1><p>Aggregated wellbeing signals to help you support your teams sooner.</p></div><div className="privacy-banner"><Icon name="shield"/><span><strong>Anonymous by design</strong>Minimum {data?.minimumGroupSize ?? 5} responses per group</span></div></div>{!data && !error ? <div className="loading-grid"><Skeleton lines={5}/><Skeleton lines={5}/></div> : error ? <EmptyState title="Team signals unavailable" text={error}/> : data ? <>
    <section className="scorecard-grid">{data.teams.map((team) => <article className="scorecard" key={team.id}><div className="scorecard-head"><div><h2>{team.name}</h2><span>{team.responses} anonymous responses</span></div><Sparkline data={team.trend}/></div><div className="scorecard-metrics"><div><span>Average mood</span><strong>{team.mood.toFixed(1)}<small>/5</small></strong></div><div><span>Stress</span><strong>{team.stress.toFixed(1)}<small>/5</small></strong></div><div><span>Workload</span><strong>{team.workload.toFixed(1)}<small>/5</small></strong></div></div><div className="participation"><span>Participation</span><strong>{team.participation}%</strong><div><i style={{ width: `${team.participation}%` }}/></div></div></article>)}</section>
    {data.suppressedTeams > 0 && <div className="minimum-note"><Icon name="lock"/><p><strong>{data.suppressedTeams} {data.suppressedTeams === 1 ? "team is" : "teams are"} hidden.</strong> Team data is shown only after at least {data.minimumGroupSize} responses. Individual responses are never exposed.</p></div>}
    <div className="team-grid"><section className="data-card span-3 heatmap-card"><div className="card-heading heatmap-heading"><div><p className="section-label">{heatmapWeeks}-week view</p><h2>Burnout-risk heatmap</h2><p>Weekly aggregated risk by team. Cells appear after the privacy minimum is met.</p></div><div className="heatmap-filters"><label>Time range<select value={heatmapWeeks} onChange={(event) => setHeatmapWeeks(Number(event.target.value))}><option value={4}>Last 4 weeks</option><option value={6}>Last 6 weeks</option><option value={12}>Last 12 weeks</option></select></label><label>Team<select value={heatmapTeamId} onChange={(event) => setHeatmapTeamId(event.target.value)}><option value="">All teams</option>{data.heatmapTeams.map((team) => <option value={team.id} key={team.id}>{team.name}</option>)}</select></label></div></div>{heatmapError ? <EmptyState title="Heatmap unavailable" text={heatmapError}/> : <div aria-busy={heatmapLoading}>{heatmapLoading ? <p className="heatmap-loading" role="status">Updating heatmap…</p> : <Heatmap data={data.heatmap} teams={visibleHeatmapTeams} weeks={heatmapWeeks}/>}</div>}<div className="heat-legend"><span><i className="heat-low"/>Low · 0–39</span><span><i className="heat-moderate"/>Moderate · 40–64</span><span><i className="heat-high"/>High · 65–100</span><span><i className="heat-unavailable"/>No eligible data</span></div><p className="heatmap-note">Weekly risk is shown only when the team meets the {data.minimumGroupSize}-response privacy minimum. Individual pulse answers are never displayed.</p></section><section className="alerts-panel span-3"><div className="card-heading"><div><p className="section-label">Early signals</p><h2>Alerts</h2></div><span className="alert-count">{visibleAlerts.length}</span></div>{visibleAlerts.length === 0 ? <EmptyState title="You’re all caught up" text="There are no open team alerts right now."/> : visibleAlerts.map((alert) => <article className={`alert-card ${alert.status === "acknowledged" ? "acknowledged" : ""}`} key={alert.id}><div className="alert-top"><span className={`severity severity-${alert.severity.toLowerCase()}`}>{alert.severity}</span><time>{alert.time}</time></div><h3>{alert.title}</h3><p>{alert.detail}</p><div className="alert-actions"><button onClick={() => void updateStatus(alert.id, "acknowledged")} disabled={alert.status === "acknowledged"}><Icon name="check" size={18}/>{alert.status === "acknowledged" ? "Acknowledged" : "Acknowledge"}</button><button onClick={() => void updateStatus(alert.id, "dismissed")}>Dismiss</button></div></article>)}</section></div>
    <section className="manager-note"><Icon name="users" size={30}/><div><h2>Turn signals into conversations.</h2><p>Use these trends to ask better questions—not to evaluate individuals. CalmWork never exposes personal pulse comments or individual activity to managers.</p></div></section>
  </> : null}</div>;
}
export function Team() { return <AppShell><TeamContent /></AppShell>; }
