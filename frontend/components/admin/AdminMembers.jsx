"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminInvitations, getAdminMembers, getAdminTeams, updateAdminMember } from "@/lib/api";
import { FieldError, Skeleton } from "../UI";
import { Icon } from "../Icon";
import { useSubscription } from "@/lib/subscription";
import { useToast } from "../Toast";
import { ROLE_FILTERS, STATUS_FILTERS, errorMessage } from "./adminHelpers";
import { AdminInviteForm } from "./AdminInviteForm";
import { AdminInvitations } from "./AdminInvitations";
import { AdminMemberTable } from "./AdminMemberTable";

const SEARCH_DEBOUNCE_MS = 300;

export function AdminMembers() {
    const { user } = useSubscription();
    const toast = useToast();
    const [teams, setTeams] = useState([]);
    const [members, setMembers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setQuery(search.trim());
            setPage(1);
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [search]);

    const refresh = useCallback(async () => {
        setError("");
        try {
            const [memberPage, teamList, invitationList] = await Promise.all([
                getAdminMembers({ page, q: query, role, status }),
                getAdminTeams(),
                getAdminInvitations(),
            ]);
            setMembers(memberPage.members);
            setTotal(memberPage.total);
            setTotalPages(memberPage.totalPages);
            setTeams(teamList);
            setInvitations(invitationList);
        }
        catch (cause) {
            setError(errorMessage(cause, "Could not load your people."));
        }
        finally {
            setLoading(false);
        }
    }, [page, query, role, status]);

    useEffect(() => { void refresh(); }, [refresh]);

    const changeMember = async (member, changes) => {
        setBusyId(member.id);
        setError("");
        try {
            await updateAdminMember(member.id, changes);
            toast(`${member.name} updated.`);
            await refresh();
        }
        catch (cause) {
            setError(errorMessage(cause, "Could not update this teammate."));
        }
        finally {
            setBusyId("");
        }
    };

    return <div className="admin-panel">
        <FieldError>{error}</FieldError>
        <div className="admin-split">
            <AdminInviteForm teams={teams} onInvited={refresh}/>
            <AdminInvitations invitations={invitations} onChanged={refresh}/>
        </div>
        <section className="data-card admin-card admin-roster">
            <div className="card-heading admin-roster-heading">
                <div><p className="section-label">Roster</p><h2>People</h2><p className="subtle-label">{total} {total === 1 ? "account" : "accounts"} in this business</p></div>
                <div className="admin-filters">
                    <label className="admin-search-field">Search<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name or email"/><Icon name="users" size={16}/></label>
                    <select aria-label="Filter by role" value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }}>{ROLE_FILTERS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                    <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>{STATUS_FILTERS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                </div>
            </div>
            {loading ? <Skeleton lines={5}/> : <AdminMemberTable members={members} teams={teams} currentUserId={user?.id} onChange={changeMember} busyId={busyId}/>}
            {totalPages > 1 && <div className="admin-pagination">
                <button type="button" className="button button-outline button-small" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button type="button" className="button button-outline button-small" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
            </div>}
        </section>
    </div>;
}
