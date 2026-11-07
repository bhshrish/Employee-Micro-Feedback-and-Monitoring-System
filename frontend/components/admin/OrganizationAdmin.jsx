"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    deleteAdminQuestion,
    deleteAdminTeam,
    exportAdminReport,
    getAdminAlertRules,
    getAdminAlerts,
    getAdminAuditLogs,
    getAdminOverview,
    getAdminQuestions,
    getAdminReports,
    getAdminSettings,
    getAdminTeams,
    getAdminUsers,
    getInvoices,
    getSubscription,
    inviteAdminUser,
    resendAdminInvite,
    saveAdminAlertRules,
    saveAdminQuestion,
    saveAdminSettings,
    saveAdminTeam,
    updateAdminAlert,
    updateAdminUser,
} from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { DataTable, ChartPanel, StatCard } from "@/components/ui/AdminPrimitives";
import { Logo } from "@/components/Logo";
import { useToast } from "@/components/Toast";

const sections = [
    ["overview", "Overview"],
    ["users", "Users"],
    ["teams", "Teams"],
    ["pulse", "Pulse management"],
    ["alerts", "Alerts & thresholds"],
    ["reports", "Reports"],
    ["billing", "Billing"],
    ["settings", "Settings"],
    ["audit", "Audit log"],
];
const emptyQuestion = { prompt: "", type: "scale", required: true, active: true, frequency: "weekly", scheduleDay: 1 };
const defaultRules = { moraleBelow: 2.5, consecutiveWeeks: 2, suddenDropPercent: 20, emailEnabled: true, inAppEnabled: true };

function PageStatus({ loading, error, empty, retry }) {
    if (loading)
        return <p className="org-state" role="status">Loading this section…</p>;
    if (error)
        return <div className="org-state org-error" role="alert"><p>{error}</p><button className="button button-outline button-small" onClick={retry}>Try again</button></div>;
    if (empty)
        return <p className="org-state">{empty}</p>;
    return null;
}

function PercentBar({ value }) {
    return <div className="org-bar" aria-label={`${value}%`}>
        <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
        <b>{value}%</b>
    </div>;
}

function LineChart({ points }) {
    const values = points.filter((point) => point.morale !== null);
    if (!values.length)
        return <p className="org-state">Not enough responses to protect anonymity.</p>;
    const coords = values.map((point, index) => {
        const x = values.length < 2 ? 50 : (index / (values.length - 1)) * 100;
        const y = 100 - ((point.morale - 1) / 4) * 90;
        return `${x},${y}`;
    }).join(" ");
    return <svg className="org-line-chart" viewBox="0 0 100 100" role="img" aria-label="Average team morale across the last 12 eligible weeks">
        <polyline points={coords} fill="none" stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </svg>;
}

function formatDate(value) {
    return value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value)) : "—";
}

export function OrganizationAdmin() {
    const [section, setSection] = useState("overview");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [teamFilter, setTeamFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [invite, setInvite] = useState({ email: "", role: "employee", teamId: "" });
    const [inviteLink, setInviteLink] = useState("");
    const [teamName, setTeamName] = useState("");
    const [question, setQuestion] = useState(emptyQuestion);
    const [editingQuestion, setEditingQuestion] = useState("");
    const [rules, setRules] = useState(defaultRules);
    const [settings, setSettings] = useState(null);
    const [period, setPeriod] = useState("7d");
    const [saved, setSaved] = useState("");
    const { user, signOut } = useSubscription();
    const router = useRouter();
    const toast = useToast();

    const loadSection = useCallback(async () => {
        setLoading(true);
        setError("");
        setSaved("");
        try {
            let result;
            if (section === "overview")
                result = await getAdminOverview();
            else if (section === "users") {
                const [users, teams] = await Promise.all([
                    getAdminUsers({ page, q: search.trim(), role: roleFilter, teamId: teamFilter, status: statusFilter }),
                    getAdminTeams(),
                ]);
                result = { ...users, teams: teams.teams };
            }
            else if (section === "teams") {
                const [teams, managers, overview] = await Promise.all([
                    getAdminTeams(),
                    getAdminUsers({ role: "manager", status: "active", page: 1 }),
                    getAdminOverview(),
                ]);
                result = {
                    teams: teams.teams,
                    managers: managers.users,
                    minimumGroupSize: overview.overview.minimumGroupSize,
                    teamScores: overview.overview.participationByTeam,
                };
            }
            else if (section === "pulse")
                result = await getAdminQuestions();
            else if (section === "alerts") {
                const [alerts, configuredRules] = await Promise.all([getAdminAlerts(), getAdminAlertRules()]);
                result = { alerts: alerts.alerts, rules: configuredRules.rules };
                setRules(configuredRules.rules);
            }
            else if (section === "reports")
                result = await getAdminReports(period);
            else if (section === "billing") {
                const [subscription, invoices] = await Promise.all([getSubscription(), getInvoices()]);
                result = { subscription: subscription.subscription, invoices: Array.isArray(invoices) ? invoices : [] };
            }
            else if (section === "settings") {
                result = await getAdminSettings();
                setSettings(result.settings);
            }
            else if (section === "audit")
                result = await getAdminAuditLogs(page);
            setData(result ?? {});
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not load this section.");
        }
        finally {
            setLoading(false);
        }
    }, [page, period, roleFilter, search, section, statusFilter, teamFilter]);

    useEffect(() => { void loadSection(); }, [loadSection]);
    useEffect(() => {
        if (user?.subscription.status === "trial_expired")
            router.replace("/billing");
    }, [router, user?.subscription.status]);

    const inviteUser = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const result = await inviteAdminUser(invite);
            setInviteLink(`${window.location.origin}/accept-invite/${result.invitation.token}`);
            setInvite((value) => ({ ...value, email: "" }));
            await loadSection();
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not invite user.");
        }
        finally {
            setLoading(false);
        }
    };

    const updateUser = async (id, patch, confirmMessage) => {
        if (confirmMessage && !window.confirm(confirmMessage))
            return;
        try {
            await updateAdminUser(id, patch);
            await loadSection();
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not update user.");
        }
    };

    const createTeam = async (event) => {
        event.preventDefault();
        try {
            await saveAdminTeam(null, { name: teamName });
            setTeamName("");
            toast("Team created.");
            await loadSection();
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not create team.");
        }
    };

    const saveQuestionForm = async (event) => {
        event.preventDefault();
        try {
            await saveAdminQuestion(editingQuestion || null, question);
            setQuestion(emptyQuestion);
            setEditingQuestion("");
            toast("Pulse question saved.");
            await loadSection();
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not save pulse question.");
        }
    };

    const downloadReport = async (format) => {
        try {
            const result = await exportAdminReport(period, format);
            if (result.locked) {
                setData(result);
                return;
            }
            const url = URL.createObjectURL(result.blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = result.filename;
            anchor.click();
            URL.revokeObjectURL(url);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not export report.");
        }
    };

    const saveSettings = async (event) => {
        event.preventDefault();
        try {
            const result = await saveAdminSettings({
                name: settings.name,
                minGroupSize: Number(settings.minGroupSize),
                dataRetentionDays: Number(settings.dataRetentionDays),
                pulseReminderEnabled: settings.pulseReminderEnabled,
                pulseReminderDay: Number(settings.pulseReminderDay),
                pulseReminderHour: Number(settings.pulseReminderHour),
            });
            setSettings(result.settings);
            setSaved("Organization settings saved.");
            toast("Organization settings saved.");
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not save settings.");
        }
    };

    const title = useMemo(() => sections.find(([key]) => key === section)?.[1] ?? "Overview", [section]);
    const selectSection = (next) => {
        setSection(next);
        setPage(1);
        setData(null);
        setError("");
    };

    return <main className="org-admin-page">
        <aside className="org-admin-sidebar">
            <Link href="/dashboard" aria-label="Go to Workwell"><Logo /></Link>
            <p className="section-label">Organization</p>
            <nav aria-label="Organization administration">
                {sections.map(([key, label]) => <button key={key} type="button" className={section === key ? "active" : ""}
                    aria-current={section === key ? "page" : undefined} onClick={() => selectSection(key)}>{label}</button>)}
            </nav>
            <div className="org-admin-user"><strong>{user?.name}</strong><span>Organization Admin</span><button type="button" onClick={async () => { await signOut(); router.replace("/login"); }}>Sign out</button></div>
        </aside>
        <section className="org-admin-main">
            <header className="org-admin-topbar"><div><p className="section-label">Organization admin</p><h1>{title}</h1></div><Link className="button button-outline button-small" href="/dashboard">Workspace</Link></header>
            {error && <div className="org-global-error" role="alert">{error}</div>}
            {saved && <p className="org-saved" role="status">{saved}</p>}
            {section === "users" && <div className="org-filters" aria-label="Filter users">
                <label>Search<input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Name or email" /></label>
                <label>Role<select value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setPage(1); }}><option value="">All roles</option><option value="admin">Admin</option><option value="manager">Manager</option><option value="employee">Employee</option></select></label>
                <label>Team<select value={teamFilter} onChange={(event) => { setTeamFilter(event.target.value); setPage(1); }}><option value="">All teams</option>{data?.teams?.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}</select></label>
                <label>Status<select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="pending_invite">Pending invitations</option></select></label>
            </div>}
            {(section === "reports") && <label className="org-period">Period<select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="7d">Weekly</option><option value="30d">Monthly</option><option value="quarter">Quarterly</option></select></label>}
            {loading && !data && <PageStatus loading />}
            {error && !data && <PageStatus error={error} retry={() => void loadSection()} />}
            {section === "overview" && data?.overview && <section className="org-admin-content">
                <div className="org-stats-grid">
                    <StatCard label="Employees" value={data.overview.employees} note="Active organization members" />
                    <StatCard label="Active teams" value={data.overview.activeTeams} />
                    <StatCard label="Pulse participation" value={`${data.overview.participationRate}%`} note="This week" />
                    <StatCard label="Average morale" value={data.overview.averageMorale ?? "—"} note={data.overview.notEnoughResponses ? "Not enough responses to protect anonymity" : "Scale of 1–5"} />
                    <StatCard label="Burnout risk" value={data.overview.burnoutRiskCount} note="Open aggregate alerts" />
                    <StatCard label="Plan status" value={data.overview.subscription.status} note={data.overview.subscription.trialEndsAt ? `Trial ends ${formatDate(data.overview.subscription.trialEndsAt)}` : data.overview.subscription.plan} />
                </div>
                <div className="org-chart-grid">
                    <ChartPanel title="Morale trend" description="12 weeks · eligible groups only"><LineChart points={data.overview.moraleTrend} /></ChartPanel>
                    <ChartPanel title="Participation by team" description="Groups below the anonymity threshold are suppressed">
                        {data.overview.participationByTeam.map((team) => <div className="org-team-bar" key={team.teamId}><span>{team.name}</span>{team.suppressed ? <span>Not enough responses to protect anonymity</span> : <PercentBar value={team.participation} />}</div>)}
                    </ChartPanel>
                </div>
            </section>}
            {section === "users" && data?.users && <section className="org-admin-content">
                <form className="org-panel org-invite-form" onSubmit={inviteUser}>
                    <h2>Invite a teammate</h2>
                    <label>Work email<input type="email" required value={invite.email} onChange={(event) => setInvite({ ...invite, email: event.target.value })} /></label>
                    <label>Role<select value={invite.role} onChange={(event) => setInvite({ ...invite, role: event.target.value })}><option value="employee">Employee</option><option value="manager">Manager</option></select></label>
                    <label>Team<select required value={invite.teamId} onChange={(event) => setInvite({ ...invite, teamId: event.target.value })}><option value="">Choose a team</option>{data.teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}</select></label>
                    <button className="button button-small" disabled={loading || !data.teams.length}>Create invite</button>
                    {inviteLink && <p className="org-invite-link" role="status">Share this single-use link: <a href={inviteLink}>{inviteLink}</a></p>}
                </form>
                <DataTable columns={["User", "Role", "Team", "Status", "Actions"]} rows={data.users.map((member) => ({
                    id: member._id,
                    cells: [
                        <>{member.name}<small>{member.email}</small></>,
                        <select aria-label={`Role for ${member.name}`} value={member.role} disabled={member.role === "admin"} onChange={(event) => void updateUser(member._id, { role: event.target.value })}><option value="admin">Admin</option><option value="manager">Manager</option><option value="employee">Employee</option></select>,
                        <select aria-label={`Team for ${member.name}`} value={member.teamId?._id ?? ""} onChange={(event) => void updateUser(member._id, { teamId: event.target.value || null })}><option value="">Unassigned</option>{data.teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}</select>,
                        member.isActive ? "Active" : "Inactive",
                        <div className="org-row-actions">
                            <button type="button" className="button button-outline button-small" onClick={() => void updateUser(member._id, { isActive: !member.isActive }, `${member.isActive ? "Deactivate" : "Reactivate"} ${member.name}?`)}>{member.isActive ? "Deactivate" : "Reactivate"}</button>
                            {!member.isActive && <button type="button" onClick={async () => { try { const result = await resendAdminInvite(member.email); setInviteLink(`${window.location.origin}/accept-invite/${result.invitation.token}`); } catch (cause) { setError(cause.message); } }}>Resend invite</button>}
                        </div>,
                    ],
                })).concat(data.invitations.map((pending) => ({
                    id: pending._id,
                    cells: [
                        <>{pending.email}<small>Invitation · expires {formatDate(pending.expiresAt)}</small></>,
                        pending.role,
                        pending.teamId?.name ?? "—",
                        new Date(pending.expiresAt) > new Date() ? "Invite pending" : "Invite expired",
                        <button type="button" className="button button-outline button-small" onClick={async () => {
                            try {
                                const result = await resendAdminInvite(pending.email);
                                setInviteLink(`${window.location.origin}/accept-invite/${result.invitation.token}`);
                            }
                            catch (cause) {
                                setError(cause.message);
                            }
                        }}>Resend invite</button>,
                    ],
                })))} emptyMessage="No users or pending invitations match these filters." />
                <div className="org-pagination"><span>{data.total} users</span><button className="button button-outline button-small" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {data.page} of {Math.max(1, data.pages)}</span><button className="button button-outline button-small" disabled={page >= data.pages} onClick={() => setPage((current) => current + 1)}>Next</button></div>
            </section>}
            {section === "teams" && data?.teams && <section className="org-admin-content">
                <form className="org-panel org-inline-form" onSubmit={createTeam}><label>New team name<input value={teamName} onChange={(event) => setTeamName(event.target.value)} minLength={2} maxLength={80} required /></label><button className="button button-small">Create team</button></form>
                <DataTable columns={["Team", "Manager", "Members", "Morale scorecard", "Actions"]} rows={data.teams.map((team) => ({
                    id: team._id,
                    cells: [
                        <input aria-label={`Team name ${team.name}`} defaultValue={team.name} onBlur={(event) => { if (event.target.value !== team.name) void saveAdminTeam(team._id, { name: event.target.value }).then(loadSection).catch((cause) => setError(cause.message)); }} />,
                        <select aria-label={`Manager for ${team.name}`} value={team.managerId?._id ?? ""} onChange={(event) => void saveAdminTeam(team._id, { managerId: event.target.value || null }).then(loadSection).catch((cause) => setError(cause.message))}><option value="">Unassigned</option>{data.managers.map((manager) => <option key={manager._id} value={manager._id}>{manager.name}</option>)}</select>,
                        team.memberCount,
                        (() => {
                            const score = data.teamScores.find((item) => item.teamId === team._id);
                            return score?.suppressed
                                ? <span>Not enough responses to protect anonymity</span>
                                : score
                                    ? <span>{score.morale} / 5 · {score.participation}% participation</span>
                                    : <span>Scorecard not available this week</span>;
                        })(),
                        <button className="button button-outline button-small" onClick={() => { if (window.confirm(`Delete ${team.name}? Teams with members must be reassigned first.`)) void deleteAdminTeam(team._id).then(loadSection).catch((cause) => setError(cause.message)); }}>Delete</button>,
                    ],
                }))} emptyMessage="Create your first team to invite members." />
            </section>}
            {section === "pulse" && data?.questions && <section className="org-admin-content">
                <form className="org-panel org-question-form" onSubmit={saveQuestionForm}>
                    <h2>{editingQuestion ? "Edit pulse question" : "Create weekly pulse question"}</h2>
                    <label>Question text<input value={question.prompt} onChange={(event) => setQuestion({ ...question, prompt: event.target.value })} minLength={3} maxLength={240} required /></label>
                    <label>Answer type<select value={question.type} onChange={(event) => setQuestion({ ...question, type: event.target.value })}><option value="scale">Scale 1–5</option><option value="yes_no">Yes / No</option><option value="short_text">Short text</option></select></label>
                    <label>Frequency<select value={question.frequency} onChange={(event) => setQuestion({ ...question, frequency: event.target.value })}><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label>
                    <label>Schedule day<select value={question.scheduleDay} onChange={(event) => setQuestion({ ...question, scheduleDay: Number(event.target.value) })}>{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label>
                    <label className="org-check"><input type="checkbox" checked={question.required} onChange={(event) => setQuestion({ ...question, required: event.target.checked })} /> Required</label>
                    <button className="button button-small">{editingQuestion ? "Save question" : "Add question"}</button>
                </form>
                <DataTable columns={["Question", "Type", "Schedule", "Status", "Actions"]} rows={data.questions.map((item) => ({
                    id: item._id,
                    cells: [
                        item.prompt,
                        item.type === "scale" ? "Scale 1–5" : item.type === "yes_no" ? "Yes / No" : "Short text",
                        `${item.frequency} · ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][item.scheduleDay]}`,
                        <button onClick={() => void saveAdminQuestion(item._id, { active: !item.active }).then(loadSection).catch((cause) => setError(cause.message))}>{item.active ? "Active" : "Inactive"}</button>,
                        <div className="org-row-actions"><button onClick={() => { setEditingQuestion(item._id); setQuestion(item); }}>Edit</button><button onClick={() => { if (window.confirm("Delete this question?")) void deleteAdminQuestion(item._id).then(loadSection).catch((cause) => setError(cause.message)); }}>Delete</button></div>,
                    ],
                }))} emptyMessage="No pulse questions configured." />
            </section>}
            {section === "alerts" && data?.alerts && <section className="org-admin-content">
                <form className="org-panel org-rules-form" onSubmit={async (event) => { event.preventDefault(); try { await saveAdminAlertRules(rules); setSaved("Alert thresholds saved."); } catch (cause) { setError(cause.message); } }}>
                    <h2>Burnout triggers</h2>
                    <label>Team morale below<input type="number" min="1" max="5" step="0.1" value={rules.moraleBelow} onChange={(event) => setRules({ ...rules, moraleBelow: Number(event.target.value) })} /></label>
                    <label>Consecutive weeks<input type="number" min="1" max="12" value={rules.consecutiveWeeks} onChange={(event) => setRules({ ...rules, consecutiveWeeks: Number(event.target.value) })} /></label>
                    <label>Sudden morale drop %<input type="number" min="1" max="100" value={rules.suddenDropPercent} onChange={(event) => setRules({ ...rules, suddenDropPercent: Number(event.target.value) })} /></label>
                    <label className="org-check"><input type="checkbox" checked={rules.emailEnabled} onChange={(event) => setRules({ ...rules, emailEnabled: event.target.checked })} /> Email notifications</label>
                    <label className="org-check"><input type="checkbox" checked={rules.inAppEnabled} onChange={(event) => setRules({ ...rules, inAppEnabled: event.target.checked })} /> In-app notifications</label>
                    <button className="button button-small">Save thresholds</button>
                    <small>Email delivery requires a configured mail service.</small>
                </form>
                <DataTable columns={["Alert", "Team", "Created", "Status", "Action"]} rows={data.alerts.map((alert) => ({
                    id: alert._id,
                    cells: [
                        <>{alert.title}<small>{alert.detail}</small></>,
                        alert.teamId?.name ?? "—",
                        formatDate(alert.createdAt),
                        alert.status,
                        alert.status === "open" ? <button className="button button-outline button-small" onClick={() => void updateAdminAlert(alert._id, "acknowledged").then(loadSection).catch((cause) => setError(cause.message))}>Acknowledge</button> : alert.status === "acknowledged" ? <button className="button button-outline button-small" onClick={() => void updateAdminAlert(alert._id, "resolved").then(loadSection).catch((cause) => setError(cause.message))}>Resolve</button> : "—",
                    ],
                }))} emptyMessage="No alerts to show." />
            </section>}
            {section === "reports" && data && <section className="org-admin-content">
                {data.locked ? <div className="org-panel org-locked"><h2>Reports are locked</h2><p>An active paid subscription is required to download weekly and monthly reports. Aggregated previews remain private and threshold-protected.</p><Link className="button" href="/billing">Upgrade subscription</Link></div> : <>
                    <div className="org-stats-grid"><StatCard label="Active hours" value={data.summary?.activeHours ?? "—"} /><StatCard label="Pulse responses" value={data.summary?.pulseParticipationResponses ?? "—"} /><StatCard label="Teams needing support" value={data.summary?.riskTeams ?? "—"} /></div>
                    <div className="org-export-actions"><button className="button button-small" onClick={() => void downloadReport("csv")}>Export CSV</button><button className="button button-outline button-small" onClick={() => void downloadReport("pdf")}>Export PDF</button></div>
                </>}
            </section>}
            {section === "billing" && data?.subscription && <section className="org-admin-content">
                <div className="org-panel org-billing"><div><p className="section-label">Current plan</p><h2>{data.subscription.plan}</h2><p>Status: {data.subscription.status}</p>{data.subscription.trialEndsAt && <p>Trial ends {formatDate(data.subscription.trialEndsAt)}</p>}</div><Link className="button" href="/billing">{data.subscription.status === "active" ? "Manage subscription" : "Upgrade plan"}</Link></div>
                <h2>Invoice history</h2>
                <DataTable columns={["Invoice", "Date", "Amount", "Status"]} rows={data.invoices.map((invoice) => ({
                    id: invoice._id,
                    cells: [invoice.number ?? invoice.stripeInvoiceId ?? "Invoice", formatDate(invoice.issuedAt), `${invoice.currency ?? "usd"} ${(invoice.amountPaid ?? 0) / 100}`, invoice.status ?? "Paid"],
                }))} emptyMessage="No invoices available yet." />
            </section>}
            {section === "settings" && settings && <section className="org-admin-content">
                <form className="org-panel org-settings-form" onSubmit={saveSettings}>
                    <h2>Organization profile and privacy</h2>
                    <label>Organization name<input value={settings.name} onChange={(event) => setSettings({ ...settings, name: event.target.value })} minLength={2} maxLength={120} required /></label>
                    <label>Data retention (days)<input type="number" min="30" max="3650" value={settings.dataRetentionDays} onChange={(event) => setSettings({ ...settings, dataRetentionDays: event.target.value })} /></label>
                    <label>Minimum anonymity group size<input type="number" min="5" max="100" value={settings.minGroupSize} onChange={(event) => setSettings({ ...settings, minGroupSize: event.target.value })} /></label>
                    <label className="org-check"><input type="checkbox" checked={settings.pulseReminderEnabled} onChange={(event) => setSettings({ ...settings, pulseReminderEnabled: event.target.checked })} /> Enable weekly pulse reminders</label>
                    <label>Reminder day<select value={settings.pulseReminderDay} onChange={(event) => setSettings({ ...settings, pulseReminderDay: Number(event.target.value) })}>{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label>
                    <label>Reminder hour<select value={settings.pulseReminderHour} onChange={(event) => setSettings({ ...settings, pulseReminderHour: Number(event.target.value) })}>{Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour}>{`${String(hour).padStart(2, "0")}:00`}</option>)}</select></label>
                    <p>Admins and managers only receive aggregates once a group reaches the configured response threshold. Individual responses are never exposed.</p>
                    <button className="button button-small">Save settings</button>
                </form>
            </section>}
            {section === "audit" && data?.logs && <section className="org-admin-content">
                <DataTable columns={["When", "Admin", "Action", "Target", "Details"]} rows={data.logs.map((log) => ({
                    id: log._id,
                    cells: [formatDate(log.createdAt), log.actorId?.name ?? "Admin", log.action, `${log.targetType}${log.targetId ? ` · ${log.targetId}` : ""}`, JSON.stringify(log.details ?? {})],
                }))} emptyMessage="No organization admin actions have been logged." />
                <div className="org-pagination"><span>{data.total} audit entries</span><button className="button button-outline button-small" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {data.page} of {Math.max(1, data.pages)}</span><button className="button button-outline button-small" disabled={page >= data.pages} onClick={() => setPage((current) => current + 1)}>Next</button></div>
            </section>}
            {loading && data && <p className="org-loading-inline" role="status">Updating…</p>}
        </section>
    </main>;
}
