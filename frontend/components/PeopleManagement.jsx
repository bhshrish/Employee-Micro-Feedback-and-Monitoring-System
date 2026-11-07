"use client";
import { useCallback, useEffect, useState } from "react";
import { useSubscription } from "@/lib/subscription";
import { AppShell } from "./AppShell";
import { Icon } from "./Icon";
import { useToast } from "./Toast";
import {
    archiveWorkspaceTeam,
    createWorkspaceTeam,
    getWorkspaceMembers,
    getWorkspaceTeams,
    inviteWorkspaceMember,
    updateWorkspaceMember,
} from "@/lib/api";

function PeopleContent() {
    const { user } = useSubscription();
    const toast = useToast();
    const [teams, setTeams] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [email, setEmail] = useState("");
    const [inviteTeam, setInviteTeam] = useState("");
    const [teamName, setTeamName] = useState("");
    const [inviteLink, setInviteLink] = useState("");
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        const [teamResult, memberResult] = await Promise.all([getWorkspaceTeams(), getWorkspaceMembers()]);
        setTeams(teamResult.teams);
        setMembers(memberResult.members);
        setInviteTeam((current) => current || teamResult.teams[0]?._id || "");
    }, []);

    useEffect(() => {
        refresh().catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load business people."))
            .finally(() => setLoading(false));
    }, [refresh]);

    const invite = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            const result = await inviteWorkspaceMember(email, inviteTeam);
            const link = new URL("/login", window.location.origin);
            link.searchParams.set("invite", result.invitation.token);
            link.searchParams.set("email", result.invitation.email);
            setInviteLink(link.toString());
            setEmail("");
            toast("Invitation created. Share the link with the employee.");
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not create invitation.");
        }
        finally {
            setSaving(false);
        }
    };

    const createTeam = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            await createWorkspaceTeam(teamName);
            setTeamName("");
            await refresh();
            toast("Team created.");
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not create team.");
        }
        finally {
            setSaving(false);
        }
    };

    const updateMember = async (member, changes) => {
        try {
            await updateWorkspaceMember(member._id, changes);
            await refresh();
            toast("Employee details updated.");
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not update employee.");
        }
    };

    const archiveTeam = async (team) => {
        try {
            await archiveWorkspaceTeam(team._id);
            await refresh();
            toast("Team archived.");
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not archive team.");
        }
    };

    const copyInvite = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            toast("Invitation link copied.");
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not copy invitation link.");
        }
    };

    return <div className="people-page">
        <div className="app-page-heading">
            <div><p className="section-label">Business management</p><h1>People & teams</h1><p>Invite employees, organize teams, and manage roles in {user?.name}&apos;s workspace.</p></div>
        </div>
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="people-grid">
            <section className="data-card people-card">
                <p className="section-label">Invite employee</p>
                <h2>Bring your team in</h2>
                <form onSubmit={invite}>
                    <label>Employee work email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoCapitalize="none" spellCheck={false}/></label>
                    <label>Assign to team<select required value={inviteTeam} onChange={(event) => setInviteTeam(event.target.value)}>{teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}</select></label>
                    <button className="button" disabled={saving || !teams.length}>{saving ? "Creating…" : "Create invitation"}<Icon name="arrow"/></button>
                </form>
                {inviteLink && <div className="invite-link-box"><p>Share this one-time invitation link. It expires in seven days.</p><input readOnly value={inviteLink}/><button type="button" className="button button-outline button-small" onClick={() => void copyInvite()}>Copy invitation link</button></div>}
            </section>
            <section className="data-card people-card">
                <p className="section-label">Workspace teams</p>
                <h2>Organize your people</h2>
                <form className="inline-form" onSubmit={createTeam}><label>New team name<input required minLength={2} maxLength={80} value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="Customer support"/></label><button className="button button-outline" disabled={saving}>Add team</button></form>
                {loading ? <p role="status">Loading teams…</p> : <ul className="team-manage-list">{teams.map((team) => <li key={team._id}><span>{team.name}</span><button className="button button-quiet button-small" disabled={members.some((member) => (member.teamId?._id ?? member.teamId) === team._id)} onClick={() => void archiveTeam(team)}>Archive</button></li>)}</ul>}
            </section>
        </div>
        <section className="data-card people-members">
            <div className="card-heading"><div><p className="section-label">Workspace roster</p><h2>Employees</h2></div><span className="subtle-label">{members.length} accounts</span></div>
            {loading ? <p role="status">Loading employees…</p> : members.length ? <div className="table-scroll"><table className="data-table">
                <thead><tr><th>Employee</th><th>Email</th><th>Role</th><th>Team</th></tr></thead>
                <tbody>{members.map((member) => <tr key={member._id}>
                    <td>{member.name}</td><td>{member.email}</td>
                    <td>{member._id === user?.id ? "Business admin" : <select value={member.role} onChange={(event) => void updateMember(member, { role: event.target.value })}><option value="employee">Employee</option><option value="manager">Manager</option></select>}</td>
                    <td><select value={member.teamId?._id ?? member.teamId ?? ""} onChange={(event) => void updateMember(member, { teamId: event.target.value || null })}><option value="">Unassigned</option>{teams.map((team) => <option value={team._id} key={team._id}>{team.name}</option>)}</select></td>
                </tr>)}</tbody>
            </table></div> : <p>No employees yet. Create an invitation to add your first employee.</p>}
        </section>
    </div>;
}

export function PeopleManagement() {
    return <AppShell><PeopleContent/></AppShell>;
}
