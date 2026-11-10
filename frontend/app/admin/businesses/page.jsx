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
    getOperationsBusinesses,
    setOperationsBusinessActive,
} from "@/lib/api";
import { errorMessage } from "@/components/admin/adminHelpers";

export function AdminBusinesses() {
    const toast = useToast();
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [data, setData] = useState(null);

    const load = useCallback(async () => {
        setError("");
        try {
            setData(await getOperationsBusinesses(page, search));
        }
        catch (cause) {
            if (cause?.status === 401)
                setAuthorized(false);
            setError(errorMessage(cause, "Could not load businesses."));
        }
    }, [page, search]);

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

    const toggleBusiness = async (business) => {
        try {
            await setOperationsBusinessActive(business._id, !business.isActive);
            await load();
            toast(`Business ${!business.isActive ? "activated" : "suspended"}.`);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not update business.");
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
                    <p>Sign in to manage businesses.</p>
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
                    <a href="/admin/businesses" style={{ display: "flex", alignItems: "center", gap: 12, padding: 10px 12px, borderRadius: 9px, background: "var(--p-soft-red)", color: "var(--p-red-dark)", fontWeight: 700, textDecoration: "none" }}><Icon name="shield" size={16} /> Businesses</a>
                    <a href="/admin/users" style={{ display: "flex", alignItems: "center", gap: 12, padding: 10px 12px, borderRadius: 9px, background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="users" size={16} /> Users</a>
                    <a href="/admin/teams" style={{ display: "flex", alignItems: "center", gap: 12, padding: 10px 12px, borderRadius: 9px, background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="users" size={16} /> Teams</a>
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
                        <h1 style={{ fontSize: 26, letterSpacing: "-.04em" }}>Businesses</h1>
                        <p style={{ color: "var(--muted)", fontSize: 15, margin: 4 }}>Manage workspaces on the platform.</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: "var(--muted)", fontSize: 14 }}>{new Date().toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                    </div>
                </header>

                <main className="admin-content">
                    <FieldError>{error}</FieldError>
                    <div className="admin-heading">
                        <div><p className="section-label">Workspaces</p><h2>Businesses</h2></div>
                        <div className="admin-search">
                            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search businesses…" className="admin-search-input" />
                        </div>
                    </div>

                    {loading ? <Skeleton lines={5} /> : (
                        <section className="data-card admin-card">
                            <div className="table-scroll">
                                <table className="data-table">
                                    <thead>
                                        <tr><th>Business</th><th>Owner email</th><th>Owner</th><th>Users</th><th>Teams</th><th>Status</th><th>Action</th></tr>
                                    </thead>
                                    <tbody>
                                        {(data ?? []).map((business) => (
                                            <tr key={business._id}>
                                                <td><strong>{business.name}</strong></td>
                                                <td><small style={{ color: "var(--muted)" }}>{business.owner?.[0]?.email ?? "—"}</small></td>
                                                <td>{business.owner?.[0]?.name ?? "—"}</td>
                                                <td>{business.users ?? "—"}</td>
                                                <td>{business.teams ?? "—"}</td>
                                                <td><span className={`admin-status ${business.isActive ? "active" : "inactive"}`}>{business.isActive ? "Active" : "Suspended"}</span></td>
                                                <td>
                                                    <button className="button button-outline button-small" onClick={() => void toggleBusiness(business)} disabled={loading}>
                                                        {business.isActive ? "Suspend" : "Activate"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {(data ?? []).length === 0 && (
                                            <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: 30 }}>No businesses found.</td></tr>
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

export default AdminBusinesses;
