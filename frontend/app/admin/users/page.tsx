"use client";

import { useCallback, useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { FieldError, Skeleton } from "@/components/UI";
import { useToast } from "@/components/Toast";
import {
    signOutOperationsAdmin,
    getOperationsAdmin,
    getOperationsUsers,
    setOperationsUserActive,
    getOperationsTeams,
} from "@/lib/api";
import { errorMessage } from "@/components/admin/adminHelpers";

export function AdminUsers() {
    const toast = useToast();
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");
    const [data, setData] = useState(null);
    const [teams, setTeams] = useState([]);

    const load = useCallback(async () => {
        setError("");
        try {
            const [users, teamList] = await Promise.all([
                getOperationsUsers(page, search),
                getOperationsTeams(),
            ]);
            setData(users);
            setTeams(teamList.teams);
        }
        catch (cause) {
            if (cause?.status === 401)
                setAuthorized(false);
            setError(errorMessage(cause, "Could not load users."));
        }
    }, [page, search, role, status]);

    useEffect(() => {
        let active = true;
        getOperationsAdmin().then(() => { if (active) setAuthorized(true); }).catch(() => { if (active) setAuthorized(false); }).finally(() => { if (active) setChecking(false); });
        return () => { active = false; };
    }, []);

    useEffect(() => { if (authorized) void load(); }, [authorized, load]);

    const signOut = async () => {
        setLoading(true);
        try {
            await signOutOperationsAdmin();
            setAuthorized(false);
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
                    <p>Use a one-time code to access platform operations.</p>
                    {error && <FieldError>{error}</FieldError>}
                    <button className="button" type="button" onClick={() => window.location.assign("/admin/login")}>Continue to administrator sign in</button>
                </div>
            </main>
        );
    }

            setData(null);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not sign out.");
        }
        finally {
            setLoading(false);
        }
    };

    const toggleUser = async (user) => {
        try {
            await setOperationsUserActive(user._id, !user.isActive);
            await load();
            toast(`Account ${!user.isActive ? "reactivated" : "deactivated"}.`);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not update user.");
        }
    };

    const assignTeam = async (user, teamId) => {
        try {
            const { assignOperationsTeam } = await import("@/lib/api");
            await assignOperationsTeam(user._id, teamId || null);
            await load();
            toast("Team assignment updated.");
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not update team assignment.");
        }
    };
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <Logo inverse style={{ marginBottom: 8 }} />
                <p className="section-label">Platform</p>
                <nav style={{ display: "grid", gap: 6, marginBottom: 20 }}>
                    <a href="/admin" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "9px", background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="chart" size={16} /> Overview</a>
                    <a href="/admin/businesses" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "9px", background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="shield" size={16} /> Businesses</a>
                    <a href="/admin/users" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "9px", background: "var(--p-soft-red)", color: "var(--p-red-dark)", fontWeight: 700, textDecoration: "none" }}><Icon name="users" size={16} /> Users</a>
                    <a href="/admin/teams" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "9px", background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="users" size={16} /> Teams</a>
                    <a href="/admin/activity" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "9px", background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="clock" size={16} /> Activity</a>
                    <a href="/admin/attendance" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "9px", background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="calendar" size={16} /> Attendance</a>
                </nav>
                <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid var(--line)", color: "var(--muted)", fontSize: 14 }}>
                    <p>Signed in as operations admin</p>
                    <button onClick={signOut} disabled={loading} style={{ marginTop: 10, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Icon name="logout" size={16} /> Sign out</button>
                </div>
            </aside>

            <div style={{ minWidth: 0 }}>
                <header className="admin-header">
                    <div>
                        <h1 style={{ fontSize: 26, letterSpacing: "-.04em" }}>Users</h1>
                        <p style={{ color: "var(--muted)", fontSize: 15, margin: 4 }}>Manage accounts across businesses.</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: "var(--muted)", fontSize: 14 }}>{new Date().toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                    </div>
                </header>

                <main className="admin-content">
                    <FieldError>{error}</FieldError>

                    <div className="admin-heading">
                        <div><p className="section-label">Accounts</p><h2>Users</h2></div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users by name or email…" className="admin-search-input" style={{ flex: 1 }} />
                            <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} style={{ minWidth: 130, minHeight: 42, padding: "8px 10px", fontSize: 15 }}>
                                <option value="">All roles</option>
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                                <option value="employee">Employee</option>
                            </select>
                            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={{ minWidth: 130, minHeight: 42, padding: "8px 10px", fontSize: 15 }}>
                                <option value="">All accounts</option>
                                <option value="active">Active</option>
                                <option value="inactive">Deactivated</option>
                            </select>
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
                                                    <button className="button button-outline button-small" onClick={() => void toggleUser(user)} disabled={loading}>
                                                        {user.isActive ? "Deactivate" : "Reactivate"}
                                                    </button>
                                                    <select
                                                        value={user.teamId?._id ?? ""}
                                                        onChange={(e) => void assignTeam(user, e.target.value)}
                                                        disabled={loading || !teams.length}
                                                        style={{ minWidth: 110, fontSize: 14 }}
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {teams.map((team) => (
                                                            <option key={team._id} value={team._id}>{team.name}</option>
                                                        ))}
                                                    </select>
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
                </main>
            </div>
        </div>
    );
}

export default AdminUsers;
