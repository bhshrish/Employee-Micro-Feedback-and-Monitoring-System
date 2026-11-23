"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getTeamData, type TeamData } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { AppShell } from "./AppShell";
import { Heatmap } from "./Charts";
import { Icon } from "./Icon";
import { FieldError, KpiCard, Skeleton } from "./UI";

function burnoutSignal(team: TeamData["teams"][number]): number | null {
    if (team.burnoutScore !== null)
        return team.burnoutScore;
    if (team.stress === null || team.workload === null || team.mood === null)
        return null;
    return Math.round(((team.stress + team.workload + (6 - team.mood)) / 15) * 100);
}

function riskLabel(score: number | null): string {
    if (score === null)
        return "Withheld";
    if (score >= 65)
        return "High";
    if (score >= 40)
        return "Elevated";
    return "Lower";
}

function MonitorContent() {
    const { user } = useSubscription();
    const [data, setData] = useState<TeamData | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (user?.role !== "business") {
            return;
        }
        let active = true;
        const timeout = window.setTimeout(() => {
            setLoading(true);
            setError("");
            getTeamData().then((result) => {
                if (active)
                    setData(result);
            }).catch((cause: unknown) => {
                if (active)
                    setError(cause instanceof Error ? cause.message : "Could not load burnout metrics.");
            }).finally(() => {
                if (active)
                    setLoading(false);
            });
        }, 0);
        return () => {
            active = false;
            window.clearTimeout(timeout);
        };
    }, [refreshKey, user?.role]);

    const summary = useMemo(() => {
        const teams = data?.teams ?? [];
        if (!teams.length)
            return { averageRisk: null, elevatedTeams: 0, highRiskTeams: 0, responses: 0, participation: null };
        const scores = teams.map(burnoutSignal).filter((score): score is number => score !== null);
        if (!scores.length)
            return { averageRisk: null, elevatedTeams: 0, highRiskTeams: 0, responses: 0, participation: null };
        return {
            averageRisk: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
            elevatedTeams: scores.filter((score) => score >= 40).length,
            highRiskTeams: scores.filter((score) => score >= 65).length,
            responses: teams.reduce((sum, team) => sum + team.responses, 0),
            participation: Math.round(teams.reduce((sum, team) => sum + team.participation, 0) / teams.length),
        };
    }, [data]);

    const rankedTeams = useMemo(
        () => [...(data?.teams ?? [])].map((team) => ({ ...team, riskScore: burnoutSignal(team) }))
            .sort((a, b) => (b.riskScore ?? -1) - (a.riskScore ?? -1)),
        [data],
    );

    if (user?.role !== "business")
        return <div className="monitoring-page"><div className="app-page-heading"><div><p className="section-label">Team wellbeing</p><h1>Business access required</h1><p>The burnout monitor is available to Business accounts.</p></div></div></div>;

    return <div className="monitoring-page">
        <header className="monitoring-heading">
            <div>
                <p className="section-label">Team wellbeing · Current week</p>
                <h1>Burnout monitor</h1>
                <p>Spot sustained workload and stress signals early, using voluntary employee check-ins.</p>
            </div>
            <div className="monitoring-heading-actions">
                <button type="button" className="button button-outline button-small" disabled={loading} onClick={() => setRefreshKey((key) => key + 1)}>
                    <Icon name="refresh" size={17}/>Refresh
                </button>
                <Link className="button button-small" href="/reports">Build a report<Icon name="arrow" size={17}/></Link>
            </div>
        </header>

        <div className="monitoring-privacy">
            <Icon name="shield" size={22}/>
            <p><strong>Group-level signals only</strong>Individual check-in responses are never shown. Team results are withheld until they meet the workspace minimum of {data?.minimumGroupSize ?? 5} responses.</p>
        </div>

        {error && <FieldError>{error}</FieldError>}
        {loading && !data ? <div className="monitoring-loading"><Skeleton lines={5}/><Skeleton lines={5}/></div> : null}
        {data && <>
            <section className="kpi-grid monitoring-kpis" aria-label="Burnout monitor metrics">
                <KpiCard label="Average burnout signal" value={summary.averageRisk === null ? "—" : `${summary.averageRisk}/100`} note="Across eligible teams this week" icon="chart"/>
                <KpiCard label="Teams with elevated signals" value={summary.elevatedTeams} note={`${summary.highRiskTeams} high · ${rankedTeams.length} eligible teams`} icon="alert"/>
                <KpiCard label="Eligible check-ins" value={summary.responses} note={`${rankedTeams.length} teams meet the response minimum`} icon="users"/>
                <KpiCard label="Average participation" value={summary.participation === null ? "—" : `${summary.participation}%`} note="Among eligible teams" icon="chart"/>
            </section>

            <div className="monitoring-dashboard-grid">
                <section className="data-card monitoring-team-card">
                    <div className="card-heading">
                        <div><p className="section-label">Team overview</p><h2>Wellbeing signals</h2></div>
                        <span className="monitoring-period-chip">This week</span>
                    </div>
                    {rankedTeams.length ? <ul className="monitoring-team-list">
                        {rankedTeams.map((team) => <li key={team.id}>
                            <div className="monitoring-team-title"><strong>{team.name}</strong><span>{riskLabel(team.riskScore)}{team.riskScore === null ? "" : ` · ${team.riskScore}/100`}</span></div>
                            <div className="monitoring-risk-track" role="meter" aria-label={`${team.name} burnout signal`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={team.riskScore ?? 0}>
                                <span className={`risk-${team.riskScore !== null && team.riskScore >= 65 ? "high" : team.riskScore !== null && team.riskScore >= 40 ? "elevated" : "lower"}`} style={{ width: `${team.riskScore ?? 0}%` }}/>
                            </div>
                            <div className="monitoring-team-metrics">
                                {team.exhaustion !== undefined && <span>Exhaustion <strong>{team.exhaustion?.toFixed(1) ?? "—"}/5</strong></span>}
                                <span>Stress <strong>{team.stress?.toFixed(1) ?? "—"}/5</strong></span>
                                <span>Workload <strong>{team.workload?.toFixed(1) ?? "—"}/5</strong></span>
                                <span>Mood <strong>{team.mood?.toFixed(1) ?? "—"}/5</strong></span>
                                {team.recovery !== undefined && <span>Recovery <strong>{team.recovery?.toFixed(1) ?? "—"}/5</strong></span>}
                                {team.control !== undefined && <span>Control <strong>{team.control?.toFixed(1) ?? "—"}/5</strong></span>}
                                {team.support !== undefined && <span>Support <strong>{team.support?.toFixed(1) ?? "—"}/5</strong></span>}
                                <span>Participation <strong>{team.participation}%</strong></span>
                            </div>
                        </li>)}
                    </ul> : <div className="monitoring-empty"><Icon name="chart" size={24}/><h3>No team results yet</h3><p>Results will appear after at least {data.minimumGroupSize} Individuals in a team submit this week’s check-in.</p></div>}
                    <p className="monitoring-note">Signal averages the seven check-in measures, reversing positive wellbeing factors. It is an early-support indicator, not a diagnosis or employee performance score.</p>
                </section>

                <section className="data-card monitoring-heatmap-card">
                    <div className="card-heading">
                        <div><p className="section-label">Six-week trend</p><h2>Burnout signal by team</h2></div>
                    </div>
                    <div className="monitoring-legend" aria-label="Burnout signal legend">
                        <span><i className="monitoring-legend-lower"/>Lower</span>
                        <span><i className="monitoring-legend-elevated"/>Elevated</span>
                        <span><i className="monitoring-legend-high"/>High</span>
                        <span><i className="monitoring-legend-empty"/>Withheld</span>
                    </div>
                    <Heatmap data={data.heatmap} teams={data.heatmapTeams} weeks={6}/>
                    <p className="monitoring-note">A dash means the team-week did not meet the privacy threshold. No individual check-ins are included.</p>
                </section>
            </div>

            <section className="data-card monitoring-alert-card">
                <div className="card-heading">
                    <div><p className="section-label">Follow-up</p><h2>Open wellbeing alerts</h2></div>
                    <span className="monitoring-period-chip">{data.alerts.length} open</span>
                </div>
                {data.alerts.length ? <ul className="monitoring-alert-list">
                    {data.alerts.slice(0, 4).map((alert) => <li key={alert.id}>
                        <span className={`monitoring-alert-mark ${alert.severity.toLowerCase()}`}><Icon name={alert.severity.toLowerCase() === "high" ? "alert" : "bell"} size={17}/></span>
                        <div><strong>{alert.title}</strong><p>{alert.detail}</p><small>{alert.time} · Aggregated team signals</small></div>
                        <span className={`monitoring-severity ${alert.severity.toLowerCase()}`}>{alert.severity}</span>
                    </li>)}
                </ul> : <div className="monitoring-clear"><Icon name="check" size={20}/>No open alerts right now.</div>}
            </section>
        </>}
    </div>;
}

export function Monitoring() {
    return <AppShell><MonitorContent/></AppShell>;
}
