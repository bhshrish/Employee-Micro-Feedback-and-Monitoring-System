"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminOverview } from "@/lib/api";
import { FieldError, KpiCard, Skeleton } from "../UI";
import { Icon } from "../Icon";
import { errorMessage } from "./adminHelpers";

const QUICK_LINKS = [
    { key: "members", title: "Invite and organize people", text: "Add teammates, set roles, and move people between teams.", icon: "users" },
    { key: "alerts", title: "Review wellbeing alerts", text: "See where aggregated stress signals need attention.", icon: "bell" },
    { key: "reports", title: "Check generated reports", text: "Track the pulse and activity reports your admins exported.", icon: "download" },
];

function RoleSplit({ overview }) {
    const rows = [
        { label: "Admins", value: overview.admins },
        { label: "Managers", value: overview.managers },
        { label: "Employees", value: overview.employees },
    ];
    const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;
    return <section className="data-card admin-card">
        <div className="card-heading"><div><p className="section-label">Access</p><h2>Role mix</h2></div><span className="subtle-label">{overview.activeMembers} active</span></div>
        <ul className="admin-role-mix">
            {rows.map((row) => <li key={row.label}>
                <span>{row.label}</span>
                <span className="admin-role-bar" aria-hidden="true"><i style={{ width: `${Math.round((row.value / total) * 100)}%` }}/></span>
                <strong>{row.value}</strong>
            </li>)}
        </ul>
        {overview.pendingInvitations > 0 && <p className="admin-note"><Icon name="mail" size={16}/>{overview.pendingInvitations} invitation{overview.pendingInvitations === 1 ? "" : "s"} still waiting to be accepted.</p>}
    </section>;
}

export function AdminOverview({ onNavigate }) {
    const [overview, setOverview] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setError("");
        try {
            setOverview(await getAdminOverview());
        }
        catch (cause) {
            setError(errorMessage(cause, "Could not load the business overview."));
        }
        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    if (loading && !overview)
        return <Skeleton lines={4}/>;

    return <div className="admin-panel">
        <FieldError>{error}</FieldError>
        {overview && <>
            <section className="kpi-grid admin-kpis">
                <KpiCard label="Active members" value={overview.activeMembers} note={`${overview.members} accounts in total`} icon="users"/>
                <KpiCard label="Teams" value={overview.teams} note="Active teams in this business" icon="shield"/>
                <KpiCard label="Pulse participation" value={`${overview.pulse.participation}%`} note={`${overview.pulse.responses} responses this week`} icon="pulse"/>
                <KpiCard label="Open alerts" value={overview.openAlerts} note="Wellbeing alerts awaiting review" icon="bell"/>
                <KpiCard label="Checked in today" value={overview.attendance.checkedInToday} note={`${overview.attendance.currentlyIn} still checked in`} icon="calendar"/>
            </section>
            <div className="admin-overview-grid">
                <RoleSplit overview={overview}/>
                <section className="data-card admin-card">
                    <p className="section-label">Next</p>
                    <h2>Keep the workspace moving</h2>
                    <ul className="admin-quick-links">
                        {QUICK_LINKS.map((link) => <li key={link.key}>
                            <button type="button" onClick={() => onNavigate(link.key)}>
                                <span className="admin-quick-icon"><Icon name={link.icon} size={18}/></span>
                                <span><strong>{link.title}</strong><small>{link.text}</small></span>
                                <Icon name="arrow" size={17}/>
                            </button>
                        </li>)}
                    </ul>
                </section>
            </div>
        </>}
    </div>;
}
