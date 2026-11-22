"use client";
import { useCallback, useEffect, useState } from "react";
import {
    createToolCalendarEvent,
    createToolPlanner,
    deleteToolPlanner,
    getToolCalendar,
    getToolPlanner,
    updateToolPlanner,
} from "@/lib/api";
import { useToast } from "./Toast";
import { Icon } from "./Icon";
import { FieldError, Skeleton } from "./UI";

const TABS = [
    ["planner", "Planner"],
    ["calendar", "Meetings & reminders"],
] as const;
type ToolTab = (typeof TABS)[number][0];
type CalendarKind = "meeting" | "reminder";

interface PlannerTask {
    _id: string;
    title: string;
    estimatedMinutes: number;
    startsAt?: string | null;
    status: string;
}

interface CalendarEvent {
    _id: string;
    title: string;
    kind: CalendarKind;
    startsAt: string;
    reminderAt: string | null;
}

interface TaskInput {
    title: string;
    estimatedMinutes: string;
    dueAt: string;
}

interface EventInput {
    kind: CalendarKind;
    title: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    reminderMinutes: string;
}

function displayDate(value: string | null | undefined): string {
    if (!value)
        return "—";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function EmployeeTools() {
    const toast = useToast();
    const [tab, setTab] = useState<ToolTab>("planner");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [tasks, setTasks] = useState<PlannerTask[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [taskInput, setTaskInput] = useState<TaskInput>({ title: "", estimatedMinutes: "30", dueAt: "" });
    const [eventInput, setEventInput] = useState<EventInput>({ kind: "meeting", title: "", startDate: "", startTime: "", endDate: "", endTime: "", reminderMinutes: "15" });

    const loadData = useCallback(async () => {
        const [planner, calendar] = await Promise.all([getToolPlanner(), getToolCalendar()]);
        setTasks(planner as PlannerTask[]);
        setEvents(calendar as CalendarEvent[]);
    }, []);

    useEffect(() => {
        let current = true;
        Promise.all([getToolPlanner(), getToolCalendar()]).then(([planner, calendar]) => {
            if (current) {
                setTasks(planner as PlannerTask[]);
                setEvents(calendar as CalendarEvent[]);
            }
        }).catch((cause: unknown) => {
            if (current)
                setError(cause instanceof Error ? cause.message : "Could not load employee tools.");
        }).finally(() => {
            if (current)
                setLoading(false);
        });
        return () => { current = false; };
    }, []);

    const runAction = async (action: () => Promise<unknown>, successMessage: string): Promise<void> => {
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

    const submitPlanner = (event: React.FormEvent<HTMLFormElement>) => {
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

    const submitEvent = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const startsAt = new Date(`${eventInput.startDate}T${eventInput.startTime}`);
        const endsAt = eventInput.kind === "meeting"
            ? new Date(`${eventInput.endDate}T${eventInput.endTime}`)
            : startsAt;
        if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime())) {
            setError("Choose a valid date and time.");
            return;
        }
        if (eventInput.kind === "meeting" && endsAt <= startsAt) {
            setError("The meeting end time must be after its start time.");
            return;
        }
        void runAction(async () => {
            await createToolCalendarEvent({
                kind: eventInput.kind,
                title: eventInput.title.trim(),
                startsAt: startsAt.toISOString(),
                endsAt: endsAt.toISOString(),
                reminderMinutes: Number(eventInput.reminderMinutes),
            });
            setEventInput({ kind: "meeting", title: "", startDate: "", startTime: "", endDate: "", endTime: "", reminderMinutes: "15" });
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
                        <label>Type<select value={eventInput.kind} onChange={(event) => setEventInput({ ...eventInput, kind: event.target.value as CalendarKind })}><option value="meeting">Meeting</option><option value="reminder">Reminder</option></select></label>
                        <label>Title<input required maxLength={160} value={eventInput.title} onChange={(event) => setEventInput({ ...eventInput, title: event.target.value })} /></label>
                    </div>
                    <div className="tool-form-row">
                        <label>Start date<input required type="date" value={eventInput.startDate} onChange={(event) => setEventInput({ ...eventInput, startDate: event.target.value })} /></label>
                        <label>Start time<input required type="time" value={eventInput.startTime} onChange={(event) => setEventInput({ ...eventInput, startTime: event.target.value })} /></label>
                    </div>
                    {eventInput.kind === "meeting" && <div className="tool-form-row">
                        <label>End date<input required type="date" value={eventInput.endDate} onChange={(event) => setEventInput({ ...eventInput, endDate: event.target.value })} /></label>
                        <label>End time<input required type="time" value={eventInput.endTime} onChange={(event) => setEventInput({ ...eventInput, endTime: event.target.value })} /></label>
                    </div>}
                    <label>Reminder lead time<select value={eventInput.reminderMinutes} onChange={(event) => setEventInput({ ...eventInput, reminderMinutes: event.target.value })}><option value="0">At event time</option><option value="15">15 minutes before</option><option value="30">30 minutes before</option><option value="60">1 hour before</option><option value="1440">1 day before</option></select></label>
                    <p className="form-note">Choose an exact start time. Reminders are scheduled relative to it.</p>
                    <button className="button button-small" disabled={saving}>Save calendar item</button>
                </form>
                <section className="data-card"><h2>Upcoming calendar</h2>{events.length === 0 ? <p>No upcoming meetings or reminders.</p> : <ul className="tool-list">{events.map((item) => <li key={item._id}><div><strong>{item.title}</strong><span>{item.kind} · Starts {displayDate(item.startsAt)} · Reminder {displayDate(item.reminderAt)}</span></div></li>)}</ul>}</section>
            </>;
        }
        return null;
    };

    return <section className="tools-page">
        <header className="page-header"><div><p className="section-label">Personal workspace</p><h1>Work tools</h1><p>Plan tasks and schedule meetings or reminders.</p></div></header>
        <nav className="tool-tabs" aria-label="Work tools">{TABS.map(([key, label]) => <button type="button" key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)} aria-pressed={tab === key}>{label}</button>)}</nav>
        <FieldError>{error}</FieldError>
        {loading ? <Skeleton lines={5} /> : <div className="tools-content">{content()}</div>}
        <p className="tools-privacy"><Icon name="shield" size={18} /> Your planner and calendar entries are private to you.</p>
    </section>;
}
