"use client";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "./AppShell";
import { Icon } from "./Icon";
import { getMyAttendance, checkInAttendance, checkOutAttendance } from "@/lib/api";
import { useToast } from "./Toast";

function formatTime(value) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function durationLabel(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

function AttendanceContent() {
    const [attendance, setAttendance] = useState({ current: null, records: [] });
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);
    const [now, setNow] = useState(Date.now());
    const toast = useToast();
    const refresh = useCallback(async () => {
        const result = await getMyAttendance();
        setAttendance(result);
    }, []);

    useEffect(() => {
        let mounted = true;
        getMyAttendance().then((result) => {
            if (mounted)
                setAttendance(result);
        }).catch((error) => {
            if (mounted)
                toast(error instanceof Error ? error.message : "Could not load attendance.");
        }).finally(() => {
            if (mounted)
                setLoading(false);
        });
        const interval = window.setInterval(() => setNow(Date.now()), 30_000);
        return () => {
            mounted = false;
            window.clearInterval(interval);
        };
    }, [toast]);

    const record = async (action) => {
        setWorking(true);
        try {
            if (action === "in")
                await checkInAttendance();
            else
                await checkOutAttendance();
            await refresh();
            toast(action === "in" ? "You are checked in." : "You are checked out.");
        }
        catch (error) {
            toast(error instanceof Error ? error.message : "Could not update your attendance.");
        }
        finally {
            setWorking(false);
        }
    };

    const currentDuration = attendance.current
        ? Math.floor((now - new Date(attendance.current.checkedInAt).getTime()) / 1000)
        : 0;
    return <div className="attendance-page">
        <div className="app-page-heading">
            <div>
                <p className="section-label">Employee attendance</p>
                <h1>Attendance</h1>
                <p>Check in when you begin work and check out when you finish. Your time is calculated from those timestamps.</p>
            </div>
        </div>
        <section className="attendance-current data-card" aria-live="polite">
            <div>
                <p className="section-label">Current status</p>
                <h2>{attendance.current ? "You are checked in" : "You are checked out"}</h2>
                {attendance.current
                    ? <p>Checked in at {formatTime(attendance.current.checkedInAt)} · Elapsed {durationLabel(currentDuration)}</p>
                    : <p>Your attendance clock starts only when you choose to check in.</p>}
            </div>
            {attendance.current
                ? <button className="button button-danger" disabled={working || loading} onClick={() => void record("out")}><Icon name="stop"/>{working ? "Checking out…" : "Check out"}</button>
                : <button className="button" disabled={working || loading} onClick={() => void record("in")}><Icon name="play"/>{working ? "Checking in…" : "Check in"}</button>}
        </section>
        <section className="data-card attendance-history">
            <div className="card-heading">
                <div><p className="section-label">Your records</p><h2>Recent attendance</h2></div>
                <span className="subtle-label">Last 30 days</span>
            </div>
            {loading ? <p role="status">Loading attendance…</p> : attendance.records.length ? <div className="table-scroll">
                <table className="data-table">
                    <thead><tr><th>Check-in</th><th>Check-out</th><th>Duration</th><th>Status</th></tr></thead>
                    <tbody>{attendance.records.map((item) => <tr key={item._id}>
                        <td>{formatTime(item.checkedInAt)}</td>
                        <td>{item.checkedOutAt ? formatTime(item.checkedOutAt) : "—"}</td>
                        <td>{item.durationSeconds == null ? durationLabel(Math.floor((now - new Date(item.checkedInAt).getTime()) / 1000)) : durationLabel(item.durationSeconds)}</td>
                        <td><span className={`attendance-status ${item.checkedOutAt ? "complete" : "open"}`}>{item.checkedOutAt ? "Complete" : "Checked in"}</span></td>
                    </tr>)}</tbody>
                </table>
            </div> : <p>No attendance records yet. Check in to start your first workday entry.</p>}
        </section>
    </div>;
}

export function Attendance() {
    return <AppShell requireApp={false}><AttendanceContent/></AppShell>;
}
