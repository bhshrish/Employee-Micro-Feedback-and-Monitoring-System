"use client";

import { useCallback, useEffect, useState } from "react";
import { archiveAdminTeam, createAdminTeam, getAdminTeams, renameAdminTeam } from "@/lib/api";
import { FieldError, Skeleton } from "../UI";
import { Icon } from "../Icon";
import { useToast } from "../Toast";
import { errorMessage, formatDate } from "./adminHelpers";

export function AdminTeams() {
    const toast = useToast();
    const [teams, setTeams] = useState([]);
    const [name, setName] = useState("");
    const [editingId, setEditingId] = useState("");
    const [editingName, setEditingName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        setError("");
        try {
            setTeams(await getAdminTeams());
        }
        catch (cause) {
            setError(errorMessage(cause, "Could not load your teams."));
        }
        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void refresh(); }, [refresh]);

    const create = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            await createAdminTeam(name.trim());
            setName("");
            toast("Team created.");
            await refresh();
        }
        catch (cause) {
            setError(errorMessage(cause, "Could not create the team."));
        }
        finally {
            setSaving(false);
        }
    };

    const saveRename = async (team) => {
        setSaving(true);
        setError("");
        try {
            await renameAdminTeam(team.id, editingName.trim());
            setEditingId("");
            setEditingName("");
            toast("Team renamed.");
            await refresh();
        }
        catch (cause) {
            setError(errorMessage(cause, "Could not rename the team."));
        }
        finally {
            setSaving(false);
        }
    };

    const archive = async (team) => {
        setSaving(true);
        setError("");
        try {
            await archiveAdminTeam(team.id);
            toast(`${team.name} archived.`);
            await refresh();
        }
        catch (cause) {
            setError(errorMessage(cause, "Could not archive the team."));
        }
        finally {
            setSaving(false);
        }
    };

    return <div className="admin-panel">
        <FieldError>{error}</FieldError>
        <section className="data-card admin-card">
            <div className="card-heading"><div><p className="section-label">Teams</p><h2>Structure the business</h2><p className="subtle-text">Teams shape pulse aggregation and keep small groups private.</p></div><span className="admin-chip"><Icon name="users" size={15}/>{teams.length} active</span></div>
            <form className="admin-inline-create" onSubmit={create}>
                <label>New team name<input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Customer support"/></label>
                <button className="button" disabled={saving || name.trim().length < 2}>Add team</button>
            </form>
        </section>
        {loading ? <Skeleton lines={3}/> : <section className="admin-team-grid">
            {teams.map((team) => <article className="data-card admin-team-card" key={team.id}>
                {editingId === team.id
                    ? <form className="admin-team-rename" onSubmit={(event) => { event.preventDefault(); void saveRename(team); }}>
                        <input aria-label={`New name for ${team.name}`} required minLength={2} maxLength={80} value={editingName} onChange={(event) => setEditingName(event.target.value)} autoFocus/>
                        <button className="button button-small" disabled={saving}>Save</button>
                        <button type="button" className="button button-quiet button-small" onClick={() => setEditingId("")}>Cancel</button>
                    </form>
                    : <>
                        <header><h3>{team.name}</h3><span className="admin-status neutral">{team.members} {team.members === 1 ? "member" : "members"}</span></header>
                        <p className="subtle-text">Created {formatDate(team.createdAt)}</p>
                        <div className="admin-team-actions">
                            <button type="button" className="button button-outline button-small" disabled={saving} onClick={() => { setEditingId(team.id); setEditingName(team.name); }}>Rename</button>
                            <button type="button" className="button button-quiet button-small" disabled={saving || team.members > 0} onClick={() => void archive(team)} title={team.members > 0 ? "Reassign members before archiving" : "Archive this team"}>Archive</button>
                        </div>
                        {team.members > 0 && <p className="admin-note"><Icon name="alert" size={15}/>Move these members before archiving.</p>}
                    </>}
            </article>)}
            {teams.length === 0 && <div className="empty-state"><Icon name="shield" size={28}/><h3>No teams yet</h3><p>Create the first team to start organizing your people.</p></div>}
        </section>}
    </div>;
}
