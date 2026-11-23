"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { FieldError, KpiCard, Skeleton } from "./UI";
import { useToast } from "./Toast";
import {
    signOutOperationsAdmin,
    getOperationsAdmin,
    getOperationsOverview,
    getOperationsBusinesses,
    setOperationsBusinessActive,
    getOperationsUsers,
    getOperationsTeams,
    getOperationsActivity,
    getOperationsAttendance,
    setOperationsUserActive,
    getOperationsLeave,
    decideOperationsLeave,
    createOperationsTeam,
    archiveOperationsTeam,
    assignOperationsTeam,
    exportOperationsAttendance,
} from "@/lib/api";
import { AdminAlerts } from "./admin/AdminAlerts";
import { errorMessage, formatDate } from "./admin/adminHelpers";

type AdminSection = "overview" | "businesses" | "users" | "teams" | "activity" | "attendance" | "leave" | "alerts";
type LeaveDecision = "approved" | "rejected";

interface OperationsBusiness {
    _id: string;
    name?: string;
    createdAt?: string | Date;
    owner?: { name?: string; email?: string } | null;
    users?: number;
    teams?: number;
    isActive?: boolean;
    business?: string;
    individuals?: number;
    employees?: number;
    sessions?: number;
    activeSeconds?: number;
    idleSeconds?: number;
}

interface OperationsTeam {
    _id: string;
    name: string;
    createdAt: string | Date;
    organizationId?: { name?: string } | null;
}

interface OperationsUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    teamId?: { _id: string; name: string } | null;
    organizationId?: { name?: string } | null;
    isActive: boolean;
}

interface OperationsLeaveRequest {
    _id: string;
    userId?: { name?: string; email?: string } | null;
    organizationId?: { name?: string } | null;
    leaveType: string;
    startsAt: string | Date;
    endsAt: string | Date;
    description?: string;
    status: string;
}

interface OperationsDashboardData {
    activeBusinesses?: number;
    businessesCount?: number;
    businesses?: OperationsBusiness[];
    activeUsers?: number;
    usersCount?: number;
    individuals?: number;
    openAttendance?: number;
    users?: OperationsUser[];
    teams?: OperationsTeam[];
    workspaces?: OperationsBusiness[];
    totalPages?: number;
    summary?: {
        employees?: number;
        totalCheckIns?: number;
        currentlyCheckedIn?: number;
        totalSeconds?: number;
    };
    records?: {
        id: string;
        employee: string;
        email: string;
        business: string;
        checkedInAt: string | Date;
        checkedOutAt?: string | Date | null;
        durationSeconds?: number;
    }[];
    requests?: OperationsLeaveRequest[];
}

const SECTIONS = [
    { key: "overview", label: "Overview", icon: "chart" },
    { key: "businesses", label: "Workspaces", icon: "users" },
    { key: "users", label: "Users", icon: "users" },
    { key: "teams", label: "Teams", icon: "users" },
    { key: "activity", label: "Activity", icon: "clock" },
    { key: "attendance", label: "Attendance", icon: "calendar" },
    { key: "leave", label: "Leave applications", icon: "calendar" },
    { key: "alerts", label: "Alerts", icon: "bell" },
] as const;

function localDateValue() {
    return new Date().toISOString().slice(0, 10);
}

function formatTime(value?: string | Date | null) {
    return value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
}

function formatDuration(seconds: number | undefined = 0) {
    const total = Math.max(0, Math.floor(seconds));
    return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m`;
}

export function AdminDashboard() {
    const toast = useToast();
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [section, setSection] = useState<AdminSection>("overview");
    const [date, setDate] = useState(localDateValue);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [data, setData] = useState<OperationsDashboardData | null>(null);
    const [teamName, setTeamName] = useState("");
    const [workspaceId, setWorkspaceId] = useState("");
    const [exporting, setExporting] = useState(false);

    const loadSection = useCallback(async () => {
        setError("");
        try {
            if (section === "overview") {
                const overview = await getOperationsOverview() as unknown as {
                    activeBusinesses: number;
                    businesses: number;
                    activeUsers: number;
                    users: number;
                    individuals: number;
                    openAttendance: number;
                };
                setData({
                    activeBusinesses: overview.activeBusinesses,
                    businessesCount: overview.businesses,
                    activeUsers: overview.activeUsers,
                    usersCount: overview.users,
                    individuals: overview.individuals,
                    openAttendance: overview.openAttendance,
                });
            }
            else if (section === "businesses")
                setData(await getOperationsBusinesses(page, search) as OperationsDashboardData);
            else if (section === "users") {
                const [users, teams] = await Promise.all([
                    getOperationsUsers(page, search),
                    getOperationsTeams(),
                ]);
                setData({ ...(users as OperationsDashboardData), teams: (teams as { teams: OperationsTeam[] }).teams });
            }
            else if (section === "teams") {
                const [teams, workspaces] = await Promise.all([
                    getOperationsTeams(),
                    getOperationsBusinesses(1),
                ]);
                const teamList = (teams as { teams: OperationsTeam[] }).teams;
                const workspaceList = (workspaces as { businesses: OperationsBusiness[] }).businesses;
                setData({ teams: teamList, workspaces: workspaceList });
                setWorkspaceId((value) => value || workspaceList[0]?._id || "");
            }
            else if (section === "activity")
                setData(await getOperationsActivity(date) as OperationsDashboardData);
            else if (section === "attendance")
                setData(await getOperationsAttendance(date, page) as OperationsDashboardData);
            else if (section === "leave")
                setData({ requests: await getOperationsLeave() as OperationsLeaveRequest[] });
        }
        catch (cause) {
            if (cause instanceof Error && "status" in cause && cause.status === 401)
                setAuthorized(false);
            setError(errorMessage(cause, "Could not load operations data."));
        }
    }, [date, page, search, section]);

    useEffect(() => {
        let active = true;
        getOperationsAdmin().then(() => {
            if (active)
                setAuthorized(true);
        }).catch(() => {
            if (active)
                setAuthorized(false);
        }).finally(() => {
            if (active)
                setChecking(false);
        });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!authorized)
            return;
        const timer = window.setTimeout(() => { void loadSection(); }, 0);
        return () => window.clearTimeout(timer);
    }, [authorized, loadSection]);

    const signOut = async () => {
        setLoading(true);
        try {
            await signOutOperationsAdmin();
            setAuthorized(false);
            setData(null);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not sign out.");
        }
        finally {
            setLoading(false);
        }
    };

    const toggleUser = async (user: OperationsUser) => {
        try {
            await setOperationsUserActive(user._id, !user.isActive);
            await loadSection();
            toast(`Account ${!user.isActive ? "reactivated" : "deactivated"}.`);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not update user.");
        }
    };

    const toggleBusiness = async (business: OperationsBusiness) => {
        try {
            await setOperationsBusinessActive(business._id, !business.isActive);
            await loadSection();
            toast(`Workspace ${!business.isActive ? "reactivated" : "deactivated"}.`);
        }
        catch (cause) {
            setError(errorMessage(cause, "Could not update workspace."));
        }
    };

    const assignTeam = async (user: OperationsUser, teamId: string) => {
        try {
            await assignOperationsTeam(user._id, teamId || null);
            await loadSection();
            toast("Team assignment updated.");
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not update team assignment.");
        }
    };

    const addTeam = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        try {
            await createOperationsTeam(workspaceId, teamName);
            setTeamName("");
            await loadSection();
            toast("Team created.");
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not create team.");
        }
        finally {
            setLoading(false);
        }
    };

    const removeTeam = async (team: OperationsTeam) => {
        if (!window.confirm(`Archive team "${team.name}"?`))
            return;
        try {
            await archiveOperationsTeam(team._id);
            await loadSection();
            toast("Team archived.");
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not archive team.");
        }
    };

    const decideLeave = async (request: OperationsLeaveRequest, status: LeaveDecision) => {
        setLoading(true);
        try {
            await decideOperationsLeave(request._id, status);
            await loadSection();
            toast(`Leave application ${status}.`);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not update leave application.");
        }
        finally {
            setLoading(false);
        }
    };

    const downloadCsv = async () => {
        setExporting(true);
        try {
            const blob = await exportOperationsAttendance(date);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `calmwork-attendance-${date}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not export attendance.");
        }
        finally {
            setExporting(false);
        }
    };

    // Not authorized yet: show the operations admin sign-in gate
    if (checking) {
        return (
            <main className="admin-auth-page">
                <div className="admin-auth-card">
                    <Logo inverse />
                    <h1>Platform operations</h1>
                    <p>Sign in with the platform operations admin account to manage users, productivity tools, attendance, and leave applications.</p>
                    <div className="admin-auth-spinner"><span className="skeleton" style={{ width: "40%", height: "14px" }} /><span className="skeleton" style={{ width: "60%", height: "14px" }} /></div>
                    <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>Checking operations access…</p>
                </div>
            </main>
        );
    }

    if (!authorized) {
        return (
            <main className="admin-auth-page">
                <div className="admin-auth-card">
                    <Logo inverse />
                    <h1>Platform operations sign-in</h1>
                    <p>Platform access requires a one-time email code.</p>
                    {error && <FieldError>{error}</FieldError>}
                    <Link className="button" href="/admin/login">Continue to administrator sign in</Link>
                </div>
            </main>
        );
    }

    // Authorized: full dashboard
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <Logo inverse style={{ marginBottom: 8 }} />
                <p className="section-label">Platform</p>
                {SECTIONS.map((item) => (
                    <button
                        key={item.key}
                        className={section === item.key ? "active" : ""}
                        onClick={() => setSection(item.key)}
                        aria-pressed={section === item.key}
                    >
                        <Icon name={item.icon} size={16} />
                        {item.label}
                    </button>
                ))}
                <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid var(--line)", color: "var(--muted)", fontSize: 14 }}>
                    <p>Signed in as operations admin</p>
                    <button
                        onClick={signOut}
                        disabled={loading}
                        style={{ marginTop: 10, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    >
                        <Icon name="logout" size={16} /> Sign out
                    </button>
                </div>
            </aside>

            <div style={{ minWidth: 0 }}>
                <header className="admin-header">
                    <div>
                        <h1 style={{ fontSize: 26, letterSpacing: "-.04em" }}>{SECTIONS.find((s) => s.key === section)?.label}</h1>
                        <p style={{ color: "var(--muted)", fontSize: 15, margin: 4 }}>{section === "overview" ? "Manage the platform workspace, teams, and attendance." : "Review and manage operations data."}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: "var(--muted)", fontSize: 14 }}>{new Date().toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                    </div>
                </header>

                <main className="admin-content">
                    <FieldError>{error}</FieldError>

                    {section === "overview" && (
                        <>
                            {loading && !data ? <Skeleton lines={5} /> : (
                                <>
                                    <section className="kpi-grid admin-kpis">
                                        <KpiCard label="Workspaces" value={data?.activeBusinesses ?? "—"} note={`Active of ${data?.businessesCount ?? "—"} workspaces`} icon="users" />
                                        <KpiCard label="Users" value={data?.activeUsers ?? "—"} note={`Active of ${data?.usersCount ?? "—"} accounts`} icon="users" />
                                        <KpiCard label="Individuals" value={data?.individuals ?? "—"} note="Individual accounts across workspaces" icon="users" />
                                        <KpiCard label="Checked in today" value={data?.openAttendance ?? "—"} note="People currently checked in" icon="calendar" />
                                    </section>
                                    <section className="data-card admin-card">
                                        <div className="card-heading"><div><p className="section-label">Quick actions</p><h2>Platform controls</h2></div></div>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginTop: 16 }}>
                                            <button className="button button-outline" onClick={() => setSection("users")}>
                                                <Icon name="users" size={16} style={{ marginRight: 8 }} /> Manage users
                                            </button>
                                            <button className="button button-outline" onClick={() => setSection("businesses")}>
                                                <Icon name="users" size={16} style={{ marginRight: 8 }} /> Manage workspaces
                                            </button>
                                            <button className="button button-outline" onClick={() => setSection("teams")}>
                                                <Icon name="users" size={16} style={{ marginRight: 8 }} /> Manage teams
                                            </button>
                                            <button className="button button-outline" onClick={() => setSection("attendance")}>
                                                <Icon name="calendar" size={16} style={{ marginRight: 8 }} /> Export attendance
                                            </button>
                                            <button className="button button-outline" onClick={() => setSection("leave")}>
                                                <Icon name="calendar" size={16} style={{ marginRight: 8 }} /> Review leave applications
                                            </button>
                                        </div>
                                    </section>
                                </>
                            )}
                        </>
                    )}

                    {section === "businesses" && (
                        <>
                            <div className="admin-heading">
                                <div><p className="section-label">Platform</p><h2>Workspaces</h2></div>
                                <div className="admin-search">
                                    <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search workspaces…" className="admin-search-input" />
                                </div>
                            </div>
                            {loading ? <Skeleton lines={5} /> : (
                                <section className="data-card admin-card">
                                    <div className="table-scroll">
                                        <table className="data-table">
                                            <thead>
                                                <tr><th>Workspace</th><th>Owner</th><th>Users</th><th>Teams</th><th>Status</th><th>Action</th></tr>
                                            </thead>
                                            <tbody>
                                                {(data?.businesses ?? []).map((business) => (
                                                    <tr key={business._id}>
                                                        <td><strong>{business.name}</strong><br /><small style={{ color: "var(--muted)" }}>{formatDate(business.createdAt)}</small></td>
                                                        <td>{business.owner?.name ?? "Owner unavailable"}<br /><small style={{ color: "var(--muted)" }}>{business.owner?.email ?? ""}</small></td>
                                                        <td>{business.users}</td>
                                                        <td>{business.teams}</td>
                                                        <td><span className={`admin-status ${business.isActive ? "active" : "inactive"}`}>{business.isActive ? "Active" : "Inactive"}</span></td>
                                                        <td>
                                                            <button
                                                                className="button button-outline button-small"
                                                                onClick={() => void toggleBusiness(business)}
                                                                disabled={loading}
                                                            >
                                                                {business.isActive ? "Deactivate" : "Reactivate"}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(data?.businesses ?? []).length === 0 && (
                                                    <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: 30 }}>No workspaces found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {(data?.totalPages ?? 1) > 1 && (
                                        <div className="admin-pagination">
                                            <button className="button button-outline button-small" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>Previous</button>
                                            <span>Page {page} of {data?.totalPages ?? 1}</span>
                                            <button className="button button-outline button-small" disabled={page >= (data?.totalPages ?? 1) || loading} onClick={() => setPage((p) => p + 1)}>Next</button>
                                        </div>
                                    )}
                                </section>
                            )}
                        </>
                    )}

                    {section === "users" && (
                        <>
                            <div className="admin-heading">
                                <div><p className="section-label">Accounts</p><h2>Users</h2></div>
                                <div className="admin-search">
                                    <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users by name or email…" className="admin-search-input" />
                                </div>
                            </div>
                            {loading ? <Skeleton lines={5} /> : (
                                <section className="data-card admin-card">
                                    <div className="table-scroll">
                                        <table className="data-table">
                                            <thead>
                                                <tr><th>User</th><th>Role</th><th>Team</th><th>Workspace</th><th>Status</th><th>Action</th></tr>
                                            </thead>
                                            <tbody>
                                                {(data?.users ?? []).map((user) => (
                                                    <tr key={user._id}>
                                                        <td><strong>{user.name}</strong><br /><small style={{ color: "var(--muted)" }}>{user.email}</small></td>
                                                        <td>{user.role}</td>
                                                        <td>{user.teamId?.name ?? <span style={{ color: "var(--muted)" }}>Unassigned</span>}</td>
                                                        <td>{user.organizationId?.name ?? "—"}</td>
                                                        <td><span className={`admin-status ${user.isActive ? "active" : "inactive"}`}>{user.isActive ? "Active" : "Deactivated"}</span></td>
                                                        <td>
                                                            <button
                                                                className="button button-outline button-small"
                                                                onClick={() => void toggleUser(user)}
                                                                disabled={loading}
                                                            >
                                                                {user.isActive ? "Deactivate" : "Reactivate"}
                                                            </button>
                                                            {data?.teams && (
                                                                <select
                                                                    value={user.teamId?._id ?? ""}
                                                                    onChange={(event) => void assignTeam(user, event.target.value)}
                                                                    disabled={loading || !data.teams.length}
                                                                    style={{ minWidth: 110, fontSize: 14 }}
                                                                >
                                                                    <option value="">Unassigned</option>
                                                                    {data.teams.map((team) => (
                                                                        <option key={team._id} value={team._id}>{team.name}</option>
                                                                    ))}
                                                                </select>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(data?.users ?? []).length === 0 && (
                                                    <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: 30 }}>No users found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {(data?.totalPages ?? 1) > 1 && (
                                        <div className="admin-pagination">
                                            <button className="button button-outline button-small" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>Previous</button>
                                            <span>Page {page} of {data?.totalPages ?? 1}</span>
                                            <button className="button button-outline button-small" disabled={page >= (data?.totalPages ?? 1) || loading} onClick={() => setPage((p) => p + 1)}>Next</button>
                                        </div>
                                    )}
                                </section>
                            )}
                        </>
                    )}

                    {section === "teams" && (
                        <>
                            <div className="admin-heading">
                                <div><p className="section-label">Teams</p><h2>Manage teams</h2></div>
                                <form className="admin-team-create" onSubmit={addTeam}>
                                    <label>
                                        <select
                                            required
                                            value={workspaceId}
                                            onChange={(event) => setWorkspaceId(event.target.value)}
                                            disabled={loading || !(data?.workspaces ?? []).length}
                                        >
                                            <option value="">Select workspace</option>
                                            {(data?.workspaces ?? []).filter((workspace) => workspace.isActive).map((workspace) => (
                                                <option key={workspace._id} value={workspace._id}>{workspace.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label>
                                        <input
                                            required
                                            minLength={2}
                                            maxLength={80}
                                            value={teamName}
                                            onChange={(event) => setTeamName(event.target.value)}
                                            placeholder="New team name"
                                            disabled={loading}
                                        />
                                    </label>
                                    <button className="button" disabled={loading || !workspaceId || teamName.trim().length < 2}>
                                        {loading ? "Creating…" : "Create team"}
                                    </button>
                                </form>
                            </div>
                            {loading ? <Skeleton lines={4} /> : (
                                <section className="data-card admin-card">
                                    <div className="table-scroll">
                                        <table className="data-table">
                                            <thead>
                                                <tr><th>Team</th><th>Workspace</th><th>Created</th><th>Action</th></tr>
                                            </thead>
                                            <tbody>
                                                {(data?.teams ?? []).map((team) => (
                                                    <tr key={team._id}>
                                                        <td><strong>{team.name}</strong></td>
                                                        <td>{team.organizationId?.name ?? "—"}</td>
                                                        <td><small style={{ color: "var(--muted)" }}>{formatDate(team.createdAt)}</small></td>
                                                        <td>
                                                            <button
                                                                className="button button-outline button-small"
                                                                onClick={() => void removeTeam(team)}
                                                                disabled={loading}
                                                            >
                                                                Archive
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(data?.teams ?? []).length === 0 && (
                                                    <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--muted)", padding: 30 }}>No teams found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}
                        </>
                    )}

                    {section === "activity" && (
                        <>
                            <div className="admin-heading">
                                <div><p className="section-label">Activity</p><h2>Workspace activity</h2></div>
                                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span>Date</span>
                                    <input type="date" value={date} onChange={(event) => setDate(event.target.value)} disabled={loading} />
                                </label>
                            </div>
                            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 16 }}>Aggregated by workspace. Individual task labels and employee activity records are not exposed.</p>
                            {loading ? <Skeleton lines={5} /> : (
                                <section className="data-card admin-card">
                                    <div className="table-scroll">
                                        <table className="data-table">
                                            <thead>
                                                <tr><th>Workspace</th><th>People active</th><th>Sessions</th><th>Active time</th><th>Idle time</th></tr>
                                            </thead>
                                            <tbody>
                                                {(data?.businesses ?? []).map((row) => (
                                                    <tr key={row._id}>
                                                        <td><strong>{row.business}</strong></td>
                                                        <td>{row.employees}</td>
                                                        <td>{row.sessions}</td>
                                                        <td>{formatDuration(row.activeSeconds)}</td>
                                                        <td>{formatDuration(row.idleSeconds)}</td>
                                                    </tr>
                                                ))}
                                                {(data?.businesses ?? []).length === 0 && (
                                                    <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: 30 }}>No activity recorded for this date.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}
                        </>
                    )}

                    {section === "attendance" && (
                        <>
                            <div className="admin-heading">
                                <div><p className="section-label">Attendance</p><h2>Attendance overview</h2></div>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span>Date</span>
                                        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} disabled={loading} />
                                    </label>
                                    <button className="button button-outline" disabled={exporting || loading} onClick={() => void downloadCsv()}>
                                        {exporting ? "Exporting…" : <><Icon name="download" size={16} style={{ marginRight: 6 }} /> Export CSV</>}
                                    </button>
                                </div>
                            </div>
                            {loading ? <Skeleton lines={5} /> : (
                                <>
                                    <section className="kpi-grid admin-kpis">
                                        <KpiCard label="People" value={data?.summary?.employees ?? "—"} note="People with attendance records" icon="users" />
                                        <KpiCard label="Check-ins" value={data?.summary?.totalCheckIns ?? "—"} note="Total check-ins today" icon="clock" />
                                        <KpiCard label="Checked in now" value={data?.summary?.currentlyCheckedIn ?? "—"} note="Currently checked in" icon="calendar" />
                                        <KpiCard label="Elapsed time" value={formatDuration(data?.summary?.totalSeconds)} note="Aggregate tracked time today" icon="clock" />
                                    </section>
                                    <section className="data-card admin-card">
                                        <div className="table-scroll">
                                            <table className="data-table">
                                                <thead>
                                                    <tr><th>Employee</th><th>Workspace</th><th>Check-in</th><th>Check-out</th><th>Duration</th><th>Status</th></tr>
                                                </thead>
                                                <tbody>
                                                    {(data?.records ?? []).map((record) => (
                                                        <tr key={record.id}>
                                                            <td><strong>{record.employee}</strong><br /><small style={{ color: "var(--muted)" }}>{record.email}</small></td>
                                                            <td>{record.business}</td>
                                                            <td>{formatTime(record.checkedInAt)}</td>
                                                            <td>{formatTime(record.checkedOutAt)}</td>
                                                            <td>{formatDuration(record.durationSeconds)}</td>
                                                            <td>{record.checkedOutAt ? "Complete" : "Checked in"}</td>
                                                        </tr>
                                                    ))}
                                                    {(data?.records ?? []).length === 0 && (
                                                        <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: 30 }}>No attendance records for this date.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        {(data?.totalPages ?? 0) > 1 && (
                                            <div className="admin-pagination">
                                                <button className="button button-outline button-small" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>Previous</button>
                                                <span>Page {page} of {data?.totalPages ?? 1}</span>
                                                <button className="button button-outline button-small" disabled={page >= (data?.totalPages ?? 1) || loading} onClick={() => setPage((p) => p + 1)}>Next</button>
                                            </div>
                                        )}
                                    </section>
                                </>
                            )}
                        </>
                    )}

                    {section === "leave" && (
                        <section className="data-card admin-card">
                            <div className="card-heading">
                                <div><p className="section-label">Requests from all workspaces</p><h2>Leave applications</h2></div>
                            </div>
                            {loading ? <Skeleton lines={5} /> : (
                                <div className="table-scroll">
                                    <table className="data-table">
                                        <thead>
                                            <tr><th>Employee</th><th>Workspace</th><th>Leave type</th><th>Dates</th><th>Reason</th><th>Status</th><th>Action</th></tr>
                                        </thead>
                                        <tbody>
                                            {(data?.requests ?? []).map((request) => (
                                                <tr key={request._id}>
                                                    <td><strong>{request.userId?.name ?? "Unknown"}</strong><br/><small>{request.userId?.email ?? ""}</small></td>
                                                    <td>{request.organizationId?.name ?? "—"}</td>
                                                    <td>{request.leaveType}</td>
                                                    <td>{formatTime(request.startsAt)}<br/>to {formatTime(request.endsAt)}</td>
                                                    <td>{request.description || "—"}</td>
                                                    <td>{request.status}</td>
                                                    <td>{request.status === "pending" && <div className="tool-actions"><button className="button button-small" disabled={loading} onClick={() => void decideLeave(request, "approved")}>Approve</button><button className="button button-outline button-small" disabled={loading} onClick={() => void decideLeave(request, "rejected")}>Decline</button></div>}</td>
                                                </tr>
                                            ))}
                                            {(data?.requests ?? []).length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: 30 }}>No leave applications found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    )}

                    {section === "alerts" && (
                        <AdminAlerts />
                    )}

                </main>
            </div>
        </div>
    );
}
