"use client";

import { useCallback, useEffect, useState } from "react";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { FieldError, KpiCard, Skeleton, Toast } from "./UI";
import { useToast } from "./Toast";
import {
    signInOperationsAdmin,
    signOutOperationsAdmin,
    getOperationsAdmin,
    getOperationsOverview,
    getOperationsBusinesses,
    getOperationsUsers,
    getOperationsTeams,
    getOperationsActivity,
    getOperationsAttendance,
    setOperationsBusinessActive,
    setOperationsUserActive,
    createOperationsTeam,
    archiveOperationsTeam,
    assignOperationsTeam,
    exportOperationsAttendance,
} from "@/lib/api";
import { AdminAlerts } from "./admin/AdminAlerts";
import { errorMessage, formatDate } from "./admin/adminHelpers";

const SECTIONS = [
    { key: "overview", label: "Overview", icon: "chart" },
    { key: "businesses", label: "Businesses", icon: "shield" },
    { key: "users", label: "Users", icon: "users" },
    { key: "teams", label: "Teams", icon: "users" },
    { key: "activity", label: "Activity", icon: "clock" },
    { key: "attendance", label: "Attendance", icon: "calendar" },
    { key: "alerts", label: "Alerts", icon: "bell" },
];

function localDateValue() {
    return new Date().toISOString().slice(0, 10);
}

function formatTime(value) {
    return value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
}

function formatDuration(seconds = 0) {
    const total = Math.max(0, Math.floor(seconds));
    return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m`;
}

export function AdminDashboard() {
    const toast = useToast();
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [section, setSection] = useState("overview");
    const [date, setDate] = useState(localDateValue);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [data, setData] = useState(null);
    const [teamName, setTeamName] = useState("");
    const [businessId, setBusinessId] = useState("");
    const [exporting, setExporting] = useState(false);

    const loadSection = useCallback(async () => {
        setError("");
        try {
            if (section === "overview")
                setData(await getOperationsOverview());
            else if (section === "businesses")
                setData(await getOperationsBusinesses(page, search));
            else if (section === "users") {
                const [users, teams] = await Promise.all([
                    getOperationsUsers(page, search),
                    getOperationsTeams(),
                ]);
                setData({ ...users, teams: teams.teams });
            }
            else if (section === "teams") {
                const [teams, businesses] = await Promise.all([
                    getOperationsTeams(),
                    getOperationsBusinesses(1),
                ]);
                setData({ teams: teams.teams, businesses: businesses.businesses });
                setBusinessId((value) => value || businesses.businesses[0]?._id || "");
            }
            else if (section === "activity")
                setData(await getOperationsActivity(date));
            else if (section === "attendance")
                setData(await getOperationsAttendance(date, page));
        }
        catch (cause) {
            if (cause?.status === 401)
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
        if (authorized)
            void loadSection();
    }, [authorized, loadSection]);

    const signIn = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            await signInOperationsAdmin("admin", "admin@gmail.com", password);
            setPassword("");
            setAuthorized(true);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Admin sign-in failed.");
        }
        finally {
            setLoading(false);
        }
    };

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

    const toggleBusiness = async (business) => {
        try {
            await setOperationsBusinessActive(business._id, !business.isActive);
            await loadSection();
            toast(`Business ${!business.isActive ? "activated" : "suspended"}.`);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not update business.");
        }
    };

    const toggleUser = async (user) => {
        try {
            await setOperationsUserActive(user._id, !user.isActive);
            await loadSection();
            toast(`Account ${!user.isActive ? "reactivated" : "deactivated"}.`);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not update user.");
        }
    };

    const assignTeam = async (user, teamId) => {
        try {
            await assignOperationsTeam(user._id, teamId || null);
            await loadSection();
            toast("Team assignment updated.");
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not update team assignment.");
        }
    };

    const addTeam = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            await createOperationsTeam(businessId, teamName);
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

    const removeTeam = async (team) => {
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

    const downloadCsv = async () => {
        setExporting(true);
        try {
            const blob = await exportOperationsAttendance(date);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `welltrack-attendance-${date}.csv`;
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
                    <p>Sign in with the platform operations admin account to manage businesses, users, teams, and attendance across the workspace.</p>
                    <div className="admin-auth-spinner"><span className="skeleton" style={{ width: "40%", height: 14px }} /><span className="skeleton" style={{ width: "60%", height: 14px }} /></div>
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
                    <p>Enter the platform operations admin credentials to open the dashboard.</p>
                    {error && <FieldError>{error}</FieldError>}
                    <form onSubmit={signIn}>
                        <label>Username<input defaultValue="admin" readOnly /></label>
                        <label>Work email<input type="email" defaultValue="admin@gmail.com" readOnly /></label>
                        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" placeholder="Operations admin password" /></label>
                        <button className="button" disabled={loading}>{loading ? "Signing in…" : "Sign in to operations"}</button>
                    </form>
                    <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 12 }}>Forgot the operations password? Set `OPS_ADMIN_PASSWORD` in the backend environment.</p>
                </div>
            </main>
        );
    }

    // Authorized: full dashboard
    return (
        <div className="admin-layout">
            <Toast />
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
                                        <KpiCard label="Businesses" value={data?.activeBusinesses ?? "—"} note={`Active of ${data?.businesses ?? "—"} workspaces`} icon="shield" />
                                        <KpiCard label="Users" value={data?.activeUsers ?? "—"} note={`Active of ${data?.users ?? "—"} accounts`} icon="users" />
                                        <KpiCard label="Employees" value={data?.employees ?? "—"} note="Active employees across workspaces" icon="users" />
                                        <KpiCard label="Checked in today" value={data?.openAttendance ?? "—"} note="Employees currently in a session" icon="calendar" />
                                    </section>
                                    <section className="data-card admin-card">
                                        <div className="card-heading"><div><p className="section-label">Quick actions</p><h2>Platform controls</h2></div></div>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginTop: 16 }}>
                                            <button className="button button-outline" onClick={() => setSection("businesses")}>
                                                <Icon name="shield" size={16} style={{ marginRight: 8 }} /> Manage businesses
                                            </button>
                                            <button className="button button-outline" onClick={() => setSection("users")}>
                                                <Icon name="users" size={16} style={{ marginRight: 8 }} /> Manage users
                                            </button>
                                            <button className="button button-outline" onClick={() => setSection("teams")}>
                                                <Icon name="users" size={16} style={{ marginRight: 8 }} /> Manage teams
                                            </button>
                                            <button className="button button-outline" onClick={() => setSection("attendance")}>
                                                <Icon name="calendar" size={16} style={{ marginRight: 8 }} /> Export attendance
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
                                <div><p className="section-label">Workspaces</p><h2>Businesses</h2></div>
                                <div className="admin-search">
                                    <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search businesses…" className="admin-search-input" />
                                </div>
                            </div>
                            {loading ? <Skeleton lines={5} /> : (
                                <section className="data-card admin-card">
                                    <div className="table-scroll">
                                        <table className="data-table">
                                            <thead>
                                                <tr><th>Business</th><th>Owner email</th><th>Owner</th><th>Users</th><th>Status</th><th>Action</th></tr>
                                            </thead>
                                            <tbody>
                                                {(data?.businesses ?? []).map((business) => (
                                                    <tr key={business._id}>
                                                        <td><strong>{business.name}</strong><br /><small style={{ color: "var(--muted)" }}>{business.owner?.[0]?.email ?? "—"}</small></td>
                                                        <td><span className={`admin-status ${business.isActive ? "active" : "inactive"}`}>{business.isActive ? "Active" : "Suspended"}</span></td>
                                                        <td>{business.owner?.[0]?.name ?? "—"}</td>
                                                        <td>{business.users ?? "—"} users</td>
                                                        <td>
                                                            <button
                                                                className="button button-outline button-small"
                                                                onClick={() => void toggleBusiness(business)}
                                                                disabled={loading}
                                                            >
                                                                {business.isActive ? "Suspend" : "Activate"}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(data?.businesses ?? []).length === 0 && (
                                                    <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: 30 }}>No businesses found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
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
                                                <tr><th>User</th><th>Role</th><th>Team</th><th>Business</th><th>Status</th><th>Action</th></tr>
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
                                            <span>Page {page} of {data.totalPages}</span>
                                            <button className="button button-outline button-small" disabled={page >= data.totalPages || loading} onClick={() => setPage((p) => p + 1)}>Next</button>
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
                                            value={businessId}
                                            onChange={(event) => setBusinessId(event.target.value)}
                                            disabled={loading || !(data?.businesses ?? []).length}
                                        >
                                            <option value="">Select business</option>
                                            {(data?.businesses ?? []).filter((business) => business.isActive).map((business) => (
                                                <option key={business._id} value={business._id}>{business.name}</option>
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
                                    <button className="button" disabled={loading || !businessId || teamName.trim().length < 2}>
                                        {loading ? "Creating…" : "Create team"}
                                    </button>
                                </form>
                            </div>
                            {loading ? <Skeleton lines={4} /> : (
                                <section className="data-card admin-card">
                                    <div className="table-scroll">
                                        <table className="data-table">
                                            <thead>
                                                <tr><th>Team</th><th>Business</th><th>Created</th><th>Action</th></tr>
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
                            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 16 }}>Aggregated by business. Individual task labels and employee activity records are not exposed.</p>
                            {loading ? <Skeleton lines={5} /> : (
                                <section className="data-card admin-card">
                                    <div className="table-scroll">
                                        <table className="data-table">
                                            <thead>
                                                <tr><th>Business</th><th>Employees active</th><th>Sessions</th><th>Active time</th><th>Idle time</th></tr>
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
                                        <KpiCard label="Employees" value={data?.summary?.employees ?? "—"} note="Employees with attendance records" icon="users" />
                                        <KpiCard label="Check-ins" value={data?.summary?.totalCheckIns ?? "—"} note="Total check-ins today" icon="clock" />
                                        <KpiCard label="Checked in now" value={data?.summary?.currentlyCheckedIn ?? "—"} note="Currently checked in" icon="calendar" />
                                        <KpiCard label="Elapsed time" value={formatDuration(data?.summary?.totalSeconds)} note="Aggregate tracked time today" icon="clock" />
                                    </section>
                                    <section className="data-card admin-card">
                                        <div className="table-scroll">
                                            <table className="data-table">
                                                <thead>
                                                    <tr><th>Employee</th><th>Business</th><th>Check-in</th><th>Check-out</th><th>Duration</th><th>Status</th></tr>
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
                                        {data?.totalPages > 1 && (
                                            <div className="admin-pagination">
                                                <button className="button button-outline button-small" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>Previous</button>
                                                <span>Page {page} of {data.totalPages}</span>
                                                <button className="button button-outline button-small" disabled={page >= data.totalPages || loading} onClick={() => setPage((p) => p + 1)}>Next</button>
                                            </div>
                                        )}
                                    </section>
                                </>
                            )}
                        </>
                    )}

                    {section === "alerts" && (
                        <AdminAlerts />
                    )}

                </main>
            </div>
        </div>
    );
}
