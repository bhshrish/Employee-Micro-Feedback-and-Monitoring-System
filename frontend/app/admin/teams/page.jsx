"use client";

import { useCallback, useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { FieldError, Skeleton, Toast } from "@/components/UI";
import { useToast } from "@/components/Toast";
import {
    signInOperationsAdmin,
    signOutOperationsAdmin,
    getOperationsAdmin,
    getOperationsTeams,
    getOperationsBusinesses,
    createOperationsTeam,
    archiveOperationsTeam,
} from "@/lib/api";
import { errorMessage, formatDate } from "@/components/admin/adminHelpers";

export function AdminTeams() {
    const toast = useToast();
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [data, setData] = useState(null);
    const [businesses, setBusinesses] = useState([]);
    const [teamName, setTeamName] = useState("");
    const [businessId, setBusinessId] = useState("");

    const load = useCallback(async () => {
        setError("");
        try {
            const [teams, bizList] = await Promise.all([
                getOperationsTeams(),
                getOperationsBusinesses(1),
            ]);
            setData(teams);
            setBusinesses(bizList.businesses);
        }
        catch (cause) {
            if (cause?.status === 401)
                setAuthorized(false);
            setError(errorMessage(cause, "Could not load teams."));
        }
    }, []);

    useEffect(() => {
        let active = true;
        getOperationsAdmin().then(() => { if (active) setAuthorized(true); }).catch(() => { if (active) setAuthorized(false); }).finally(() => { if (active) setChecking(false); });
        return () => { active = false; };
    }, []);

    useEffect(() => { if (authorized) void load(); }, [authorized, load]);

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

    const addTeam = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            await createOperationsTeam(businessId, teamName.trim());
            setTeamName("");
            await load();
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
            await load();
            toast("Team archived.");
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not archive team.");
        }
    };

    if (checking) {
        return (
            <main className="admin-auth-page">
                <div className="admin-auth-card">
                    <Logo inverse />
                    <h1>Platform operations</h1>
                    <p>Checking operations access…</p>
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
                    <p>Sign in to manage teams.</p>
                    {error && <FieldError>{error}</FieldError>}
                    <form onSubmit={signIn}>
                        <label>Username<input defaultValue="admin" readOnly /></label>
                        <label>Work email<input type="email" defaultValue="admin@gmail.com" readOnly /></label>
                        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="Operations admin password" /></label>
                        <button className="button" disabled={loading}>{loading ? "Signing in…" : "Sign in to operations"}</button>
                    </form>
                </div>
            </main>
        );
    }
    return (
        <div className="admin-layout">
            <Toast />
            <aside className="admin-sidebar">
                <Logo inverse style={{ marginBottom: 8 }} />
                <p className="section-label">Platform</p>
                <nav style={{ display: "grid", gap: 6, marginBottom: 20 }}>
                    <a href="/admin" style={{ display: "flex", alignItems: "center", gap: 12, padding: 10px 12px, borderRadius: 9px, background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="chart" size={16} /> Overview</a>
                    <a href="/admin/businesses" style={{ display: "flex", alignItems: "center", gap: 12, padding: 10px 12px, borderRadius: 9px, background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="shield" size={16} /> Businesses</a>
                    <a href="/admin/users" style={{ display: "flex", alignItems: "center", gap: 12, padding: 10px 12px, borderRadius: 9px, background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="users" size={16} /> Users</a>
                    <a href="/admin/teams" style={{ display: "flex", alignItems: "center", gap: 12, padding: 10px 12px, borderRadius: 9px, background: "var(--p-soft-red)", color: "var(--p-red-dark)", fontWeight: 700, textDecoration: "none" }}><Icon name="users" size={16} /> Teams</a>
                    <a href="/admin/activity" style={{ display: "flex", alignItems: "center", gap: 12, padding: 10px 12px, borderRadius: 9px, background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="clock" size={16} /> Activity</a>
                    <a href="/admin/attendance" style={{ display: "flex", alignItems: "center", gap: 12, padding: 10px 12px, borderRadius: 9px, background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="calendar" size={16} /> Attendance</a>
                </nav>
                <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid var(--line)", color: "var(--muted)", fontSize: 14 }}>
                    <p>Signed in as operations admin</p>
                    <button onClick={signOut} disabled={loading} style={{ marginTop: 10, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Icon name="logout" size={16} /> Sign out</button>
                </div>
            </aside>

            <div style={{ minWidth: 0 }}>
                <header className="admin-header">
                    <div>
                        <h1 style={{ fontSize: 26, letterSpacing: "-.04em" }}>Teams</h1>
                        <p style={{ color: "var(--muted)", fontSize: 15, margin: 4 }}>Structure the business into teams.</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: "var(--muted)", fontSize: 14 }}>{new Date().toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                    </div>
                </header>

                <main className="admin-content">
                    <FieldError>{error}</FieldError>

                    <div className="admin-heading">
                        <div><p className="section-label">Teams</p><h2>Manage teams</h2></div>
                        <form className="admin-team-create" onSubmit={addTeam}>
                            <label>
                                <select
                                    required
                                    value={businessId}
                                    onChange={(e) => setBusinessId(e.target.value)}
                                    disabled={loading || businesses.length === 0}
                                >
                                    <option value="">Select business</option>
                                    {businesses.filter((b) => b.isActive).map((b) => (
                                        <option key={b._id} value={b._id}>{b.name}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                <input
                                    required
                                    minLength={2}
                                    maxLength={80}
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
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
                                        {(data ?? []).map((team) => (
                                            <tr key={team._id}>
                                                <td><strong>{team.name}</strong></td>
                                                <td>{team.organizationId?.name ?? "—"}</td>
                                                <td><small style={{ color: "var(--muted)" }}>{formatDate(team.createdAt)}</small></td>
                                                <td>
                                                    <button className="button button-outline button-small" onClick={() => void removeTeam(team)} disabled={loading}>
                                                        Archive
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {(data ?? []).length === 0 && (
                                            <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--muted)", padding: 30 }}>No teams found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}

export default AdminTeams;
