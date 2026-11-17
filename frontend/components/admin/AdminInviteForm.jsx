"use client";

import { useEffect, useState } from "react";
import { createAdminInvitation } from "@/lib/api";
import { FieldError } from "../UI";
import { Icon } from "../Icon";
import { useToast } from "../Toast";
import { buildInviteLink, errorMessage } from "./adminHelpers";

export function AdminInviteForm({ teams, onInvited }) {
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [teamId, setTeamId] = useState("");
    const [role, setRole] = useState("employee");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [inviteLink, setInviteLink] = useState("");

    useEffect(() => {
        setTeamId((current) => current || teams[0]?.id || "");
    }, [teams]);

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            const invitation = await createAdminInvitation(email.trim(), teamId, role);
            setInviteLink(buildInviteLink(invitation.token, invitation.email));
            setEmail("");
            toast(`Invitation ready for ${invitation.email}.`);
            await onInvited?.();
        }
        catch (cause) {
            setError(errorMessage(cause, "Could not create the invitation."));
        }
        finally {
            setSaving(false);
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            toast("Invitation link copied.");
        }
        catch (cause) {
            setError(errorMessage(cause, "Could not copy the invitation link."));
        }
    };

    return <section className="data-card admin-card">
        <div className="card-heading"><div><p className="section-label">Invite</p><h2>Add a teammate</h2></div><span className="admin-chip"><Icon name="mail" size={15}/>7-day link</span></div>
        <form className="admin-form" onSubmit={submit}>
            <label>Work email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="teammate@company.com" autoCapitalize="none" spellCheck={false}/></label>
            <div className="admin-form-row">
                <label>Team<select required value={teamId} onChange={(event) => setTeamId(event.target.value)} disabled={!teams.length}>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
                <label>Role<select value={role} onChange={(event) => setRole(event.target.value)}><option value="employee">Employee</option><option value="manager">Manager</option></select></label>
            </div>
            <FieldError>{error}</FieldError>
            {!teams.length && <p className="admin-note"><Icon name="alert" size={16}/>Create a team before inviting people.</p>}
            <button className="button" disabled={saving || !teams.length}>{saving ? "Creating…" : "Create invitation"}<Icon name="arrow" size={17}/></button>
        </form>
        {inviteLink && <div className="invite-link-box">
            <p>Share this one-time link. It stops working once it is accepted or after seven days.</p>
            <input readOnly value={inviteLink} onFocus={(event) => event.target.select()}/>
            <button type="button" className="button button-outline button-small" onClick={() => void copyLink()}>Copy invitation link</button>
        </div>}
    </section>;
}

</final_file_content>
