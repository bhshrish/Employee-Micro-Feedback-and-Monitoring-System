"use client";
import { useCallback, useEffect, useState } from "react";
import {
    createToolCalendarEvent,
    createToolLeave,
    createToolPlanner,
    decideToolLeave,
    deleteToolPlanner,
    getToolCalendar,
    getToolLeave,
    getToolPlanner,
    updateToolPlanner,
} from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { useToast } from "./Toast";
import { Icon } from "./Icon";
import { FieldError, Skeleton } from "./UI";

const TABS = [
    ["planner", "Planner"],
    ["calendar", "Meetings & reminders"],
    ["leave", "Leave"],
];

function displayDate(value) {
    if (!value)
        return "—";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function EmployeeTools() {
    const { user } = useSubscription();
    const toast = useToast();
    const [tab, setTab] = useState("planner");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [tasks, setTasks] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [events, setEvents] = useState([]);
    const [taskInput, setTaskInput] = useState({ title: "", estimatedMinutes: "30", dueAt: "" });
    const [leaveInput, setLeaveInput] = useState({ leaveType: "annual", startsAt: "", endsAt: "", reason: "" });
    const [eventInput, setEventInput] = useState({ kind: "meeting", title: "", startsAt: "", endsAt: "", reminderMinutes: "15" });
    const isManager = user?.role === "admin" || user?.role === "manager";

    const loadData = useCallback(async () => {
        setError("");
        const results = await Promise.all([
            getToolPlanner(),
            getToolLeave(),
            getToolCalendar(),
        ]);
        setTasks(results[0]);
        setLeaveRequests(results[1]);
        setEvents(results[2]);
    }, [isManager]);

    useEffect(() => {
        let current = true;
        loadData().catch((cause) => {
            if (current)
                setError(cause instanceof Error ? cause.message : "Could not load employee tools.");
        }).finally(() => {
            if (current)
                setLoading(false);
        });
        return () => { current = false; };
    }, [loadData]);

    const runAction = async (action, successMessage) => {
        setSaving(true);
        setError("");
        try {
            await action();
            await loadData();
            toast(successMessage);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "The request could not be completed.");
        }
        finally {
            setSaving(false);
        }
    };

    const submitPlanner = (event) => {
        event.preventDefault();
        void runAction(async () => {
            await createToolPlanner({
                title: taskInput.title.trim(),
                estimatedMinutes: Number(taskInput.estimatedMinutes),
                ...(taskInput.dueAt ? { dueAt: new Date(taskInput.dueAt).toISOString() } : {}),
            });
            setTaskInput({ title: "", estimatedMinutes: "30", dueAt: "" });
        }, "Planner task added.");
    };

    const submitLeave = (event) => {
        event.preventDefault();
        void runAction(async () => {
            await createToolLeave({
                ...leaveInput,
                startsAt: new Date(leaveInput.startsAt).toISOString(),
                endsAt: new Date(leaveInput.endsAt).toISOString(),
            });
            setLeaveInput({ leaveType: "annual", startsAt: "", endsAt: "", reason: "" });
        }, "Leave request submitted.");
    };

    const submitEvent = (event) => {
        event.preventDefault();
        void runAction(async () => {
            await createToolCalendarEvent({
                ...eventInput,
                startsAt: new Date(eventInput.startsAt).toISOString(),
                endsAt: new Date(eventInput.endsAt).toISOString(),
                reminderMinutes: Number(eventInput.reminderMinutes),
            });
            setEventInput({ kind: "meeting", title: "", startsAt: "", endsAt: "", reminderMinutes: "15" });
        }, "Calendar item saved.");
    };

    const content = () => {
        if (tab === "planner") {
            return <>
                <form className="data-card tool-form" onSubmit={submitPlanner}>
                    <h2>Plan a task</h2>
                    <label>Task<input required maxLength={160} value={taskInput.title} onChange={(event) => setTaskInput({ ...taskInput, title: event.target.value })} /></label>
                    <div className="tool-form-row">
                        <label>Estimated minutes<input type="number" min="0" max="1440" value={taskInput.estimatedMinutes} onChange={(event) => setTaskInput({ ...taskInput, estimatedMinutes: event.target.value })} /></label>
                        <label>Due date<input type="datetime-local" value={taskInput.dueAt} onChange={(event) => setTaskInput({ ...taskInput, dueAt: event.target.value })} /></label>
                    </div>
                    <button className="button button-small" disabled={saving}>Add to planner</button>
                </form>
                <section className="data-card"><h2>Your tasks</h2>{tasks.length === 0 ? <p>No tasks yet.</p> : <ul className="tool-list">{tasks.map((task) => <li key={task._id}><div><strong>{task.title}</strong><span>{task.estimatedMinutes} min · Due {displayDate(task.startsAt)}</span></div><div className="tool-actions">{task.status === "open" && <button className="button button-quiet button-small" disabled={saving} onClick={() => void runAction(() => updateToolPlanner(task._id, { status: "completed" }), "Task completed.")}>Complete</button>}<button className="button button-quiet button-small" disabled={saving} onClick={() => void runAction(() => deleteToolPlanner(task._id), "Task removed.")}>Remove</button></div></li>)}</ul>}</section>
            </>;
        }
        if (tab === "calendar") {
            return <>
                <form className="data-card tool-form" onSubmit={submitEvent}>
                    <h2>Add a meeting or reminder</h2>
                    <div className="tool-form-row">
                        <label>Type<select value={eventInput.kind} onChange={(event) => setEventInput({ ...eventInput, kind: event.target.value })}><option value="meeting">Meeting</option><option value="reminder">Reminder</option></select></label>
                        <label>Title<input required maxLength={160} value={eventInput.title} onChange={(event) => setEventInput({ ...eventInput, title: event.target.value })} /></label>
                    </div>
                    <div className="tool-form-row">
                        <label>Starts<input required type="datetime-local" value={eventInput.startsAt} onChange={(event) => setEventInput({ ...eventInput, startsAt: event.target.value })} /></label>
                        <label>Ends<input required type="datetime-local" value={eventInput.endsAt} onChange={(event) => setEventInput({ ...eventInput, endsAt: event.target.value })} /></label>
                    </div>
                    <label>Reminder lead time<select value={eventInput.reminderMinutes} onChange={(event) => setEventInput({ ...eventInput, reminderMinutes: event.target.value })}><option value="0">At event time</option><option value="15">15 minutes before</option><option value="30">30 minutes before</option><option value="60">1 hour before</option><option value="1440">1 day before</option></select></label>
                    <button className="button button-small" disabled={saving}>Save calendar item</button>
                </form>
                <section className="data-card"><h2>Upcoming calendar</h2>{events.length === 0 ? <p>No upcoming meetings or reminders.</p> : <ul className="tool-list">{events.map((item) => <li key={item._id}><div><strong>{item.title}</strong><span>{item.kind} · {displayDate(item.startsAt)} · Reminder {displayDate(item.reminderAt)}</span></div></li>)}</ul>}</section>
            </>;
        }
        if (tab === "leave") {
            return <>
                {user?.role === "employee" && <form className="data-card tool-form" onSubmit={submitLeave}>
                    <h2>Request leave</h2>
                    <div className="tool-form-row">
                        <label>Leave type<select value={leaveInput.leaveType} onChange={(event) => setLeaveInput({ ...leaveInput, leaveType: event.target.value })}><option value="annual">Annual</option><option value="sick">Sick</option><option value="personal">Personal</option><option value="other">Other</option></select></label>
                        <label>Reason (optional)<input maxLength={1000} value={leaveInput.reason} onChange={(event) => setLeaveInput({ ...leaveInput, reason: event.target.value })} /></label>
                    </div>
                    <div className="tool-form-row"><label>Starts<input required type="datetime-local" value={leaveInput.startsAt} onChange={(event) => setLeaveInput({ ...leaveInput, startsAt: event.target.value })} /></label><label>Ends<input required type="datetime-local" value={leaveInput.endsAt} onChange={(event) => setLeaveInput({ ...leaveInput, endsAt: event.target.value })} /></label></div>
                    <button className="button button-small" disabled={saving}>Submit request</button>
                </form>}
                <section className="data-card"><h2>{isManager ? "Workspace leave requests" : "Your leave requests"}</h2>{leaveRequests.length === 0 ? <p>No leave requests yet.</p> : <ul className="tool-list">{leaveRequests.map((item) => <li key={item._id}><div><strong>{item.userId?.name || item.title}</strong><span>{item.leaveType} · {displayDate(item.startsAt)} – {displayDate(item.endsAt)} · {item.status}</span>{item.description && <span>{item.description}</span>}</div>{isManager && item.status === "pending" && <div className="tool-actions"><button className="button button-small" disabled={saving} onClick={() => void runAction(() => decideToolLeave(item._id, "approved"), "Leave approved.")}>Approve</button><button className="button button-outline button-small" disabled={saving} onClick={() => void runAction(() => decideToolLeave(item._id, "rejected"), "Leave declined.")}>Decline</button></div>}</li>)}</ul>}</section>
            </>;
        }
        return null;
    };

    return <section className="tools-page">
        <header className="page-header"><div><p className="section-label">Personal workspace</p><h1>Work tools</h1><p>Plan tasks, manage meetings, and submit leave requests.</p></div></header>
        <nav className="tool-tabs" aria-label="Work tools">{TABS.map(([key, label]) => <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)} aria-pressed={tab === key}>{label}</button>)}</nav>
        <FieldError>{error}</FieldError>
        {loading ? <Skeleton lines={5} /> : <div className="tools-content">{content()}</div>}
        <p className="tools-privacy"><Icon name="shield" size={18} /> Your planner and calendar entries are private to you. Leave requests are visible to workspace administrators.</p>
    </section>;
}
