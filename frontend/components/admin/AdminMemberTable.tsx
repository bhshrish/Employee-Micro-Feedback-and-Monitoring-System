"use client";

import { Icon } from "../Icon";
import { ROLE_LABELS, formatDate, roleLabel } from "./adminHelpers";

export function AdminMemberTable({ members, teams, currentUserId, onChange, busyId }) {
    if (!members.length)
        return <div className="empty-state"><Icon name="users" size={28}/><h3>No people match these filters</h3><p>Try a different search, role, or account status.</p></div>;

    return <div className="table-scroll"><table className="data-table admin-table">
        <thead><tr><th>Member</th><th>Role</th><th>Team</th><th>Status</th><th>Joined</th><th>Account</th></tr></thead>
        <tbody>{members.map((member) => {
            const isSelf = member.id === currentUserId;
            const busy = busyId === member.id;
            return <tr key={member.id}>
                <td><strong>{member.name}</strong>{isSelf && <span className="admin-self-tag">You</span>}<br/><small>{member.email}</small></td>
                <td>{isSelf
                    ? <span className="admin-static-value">{roleLabel(member.role)}</span>
                    : <select aria-label={`Role for ${member.name}`} value={member.role} disabled={busy} onChange={(event) => void onChange(member, { role: event.target.value })}>
                        {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>}</td>
                <td><select aria-label={`Team for ${member.name}`} value={member.teamId ?? ""} disabled={busy} onChange={(event) => void onChange(member, { teamId: event.target.value || null })}>
                    <option value="">Unassigned</option>
                    {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select></td>
                <td><span className={`admin-status ${member.isActive ? "active" : "inactive"}`}>{member.isActive ? "Active" : "Deactivated"}</span></td>
                <td><small>{formatDate(member.createdAt)}</small></td>
                <td>{isSelf
                    ? <span className="admin-static-value">Signed in</span>
                    : <button type="button" className="button button-outline button-small" disabled={busy} onClick={() => void onChange(member, { isActive: !member.isActive })}>{member.isActive ? "Deactivate" : "Reactivate"}</button>}</td>
            </tr>;
        })}</tbody>
    </table></div>;
}
