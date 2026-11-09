"use client";

import { useState } from "react";
import { cancelAdminInvitation, resendAdminInvitation } from "@/lib/api";
import { FieldError } from "../UI";
import { Icon } from "../Icon";
import { useToast } from "../Toast";
import { buildInviteLink, errorMessage, formatDate, roleLabel } from "./adminHelpers";

export function AdminInvitations({ invitations, onChanged }) {
    const toast = useToast();
    const [busyId, setBusyId] = useState("");
    const [error, setError] = useState("");
    const [freshLink, setFreshLink] = useState("");

    const resend = async (invitation) => {
        setBusyId(invitation.id);
        setError("");
        try {
            const refreshed = await resendAdminInvitation(invitation.email);
            const link = buildInviteLink(refreshed.token, refreshed.email);
            setFreshLink(link);
            await navigator.clipboard.writeText(link);
            toast(`Fresh invitation link for ${refreshed.email} copied.`);
            await onChanged?.();
        }
        catch (cause) {
            setError(errorMessage(cause, "Could not reissue the invitation."));
        }
        finally {
            setBusyId("");
        }
    };

    const cancel = async (invitation) => {
        setBusyId(invitation.id);
        setError("");
        try {
            await cancelAdminInvitation(invitation.id);
            toast(`Invitation for ${invitation.email} cancelled.`);
            await onChanged?.();
        }
        catch (cause) {
            setError(errorMessage(cause, "Could not cancel the invitation."));
        }
        finally {
            setBusyId("");
        }
    };

    return <section className="data-card admin-card">
        <div className="card-heading"><div><p className="section-label">Pending</p><h2>Open invitations</h2></div><span className="subtle-label">{invitations.length} waiting</span></div>
        <FieldError>{error}</FieldError>
        {invitations.length === 0
            ? <p className="admin-note"><Icon name="check" size={16}/>Every invitation has been accepted or cancelled.</p>
            : <ul className="admin-invitation-list">{invitations.map((invitation) => <li key={invitation.id}>
                <div>
                    <strong>{invitation.email}</strong>
                    <small>{roleLabel(invitation.role)} · {invitation.teamName ?? "Unassigned"} · expires {formatDate(invitation.expiresAt)}</small>
                </div>
                <div className="admin-invitation-actions">
                    <button type="button" className="button button-outline button-small" disabled={busyId === invitation.id} onClick={() => void resend(invitation)}>Copy link</button>
                    <button type="button" className="button button-quiet button-small" disabled={busyId === invitation.id} onClick={() => void cancel(invitation)}>Cancel</button>
                </div>
            </li>)}</ul>}
        {freshLink && <div className="invite-link-box">
            <p>A new link was created and the old one stopped working.</p>
            <input readOnly value={freshLink} onFocus={(event) => event.target.select()}/>
        </div>}
    </section>;
}
