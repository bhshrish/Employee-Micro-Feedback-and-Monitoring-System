"use client";
import { useCallback, useEffect, useState } from "react";
import {
    calculateSalaryEstimate,
    createToolCalendarEvent,
    createToolLeave,
    createToolPlanner,
    createToolSignature,
    decideToolLeave,
    deleteToolPlanner,
    getToolCalendar,
    getToolLeave,
    getToolPlanner,
    getToolSignatures,
    getWorkspaceMembers,
    signToolDocument,
    updateToolPlanner,
} from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { useToast } from "./Toast";
import { Icon } from "./Icon";
import { FieldError, Skeleton } from "./UI";

const TABS = [
    ["planner", "Planner"],
    ["salary", "Salary checker"],
    ["calendar", "Meetings & reminders"],
    ["leave", "Leave"],
    ["signatures", "Signatures"],
];

function displayDate(value) {
    if (!value)
        return "—";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function localDateTime(value) {
    const date = new Date(value);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
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
    const [documents, setDocuments] = useState([]);
    const [members, setMembers] = useState([]);
    const [salaryEstimate, setSalaryEstimate] = useState(null);
    const [salaryInput, setSalaryInput] = useState({ grossMonthly: "", deductionsMonthly: "", estimatedTaxRate: "0" });
    const [taskInput, setTaskInput] = useState({ title: "", estimatedMinutes: "30", dueAt: "" });
    const [leaveInput, setLeaveInput] = useState({ leaveType: "annual", startsAt: "", endsAt: "", reason: "" });
    const [eventInput, setEventInput] = useState({ kind: "meeting", title: "", startsAt: "", endsAt: "", reminderMinutes: "15" });
    const [signatureInput, setSignatureInput] = useState({ employeeId: "", title: "", documentText: "" });
    const [signedName, setSignedName] = useState("");
    const [signatureConsent, setSignatureConsent] = useState(false);
    const isManager = user?.role === "admin" || user?.role === "manager";

    const loadData = useCallback(async () => {
        setError("");
        const results = await Promise.all([
            getToolPlanner(),
            getToolLeave(),
            getToolCalendar(),
            getToolSignatures(),
            isManager ? getWorkspaceMembers() : Promise.resolve([]),
        ]);
        setTasks(results[0]);
        setLeaveRequests(results[1]);
        setEvents(results[2]);
        setDocuments(results[3]);
        setMembers(Array.isArray(results[4]) ? results[4] : results[4]?.members ?? []);
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

    const submitSalary = (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        calculateSalaryEstimate({
            grossMonthly: Number(salaryInput.grossMonthly),
            deductionsMonthly: Number(salaryInput.deductionsMonthly || 0),
            estimatedTaxRate: Number(salaryInput.estimatedTaxRate || 0),
        }).then(setSalaryEstimate).catch((cause) => {
            setError(cause instanceof Error ? cause.message : "Could not calculate the salary estimate.");
        }).finally(() => setSaving(false));
    };

    const submitSignature = (event) => {
        event.preventDefault();
        void runAction(async () => {
            await createToolSignature(signatureInput);
            setSignatureInput({ employeeId: "", title: "", documentText: "" });
        }, "Signature request sent.");
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
        if (tab === "salary") {
            return user?.role !== "employee" ? <section className="data-card"><h2>Salary checker</h2><p>This private calculator is available only in an employee account. Salary inputs are not stored or visible to business administrators.</p></section> : <>
                <form className="data-card tool-form" onSubmit={submitSalary}>
                    <h2>Estimate your take-home pay</h2>
                    <p>Enter your own figures. CalmWork calculates an estimate for this session and does not save salary inputs.</p>
                    <label>Gross monthly pay<input type="number" min="0" step="0.01" required value={salaryInput.grossMonthly} onChange={(event) => setSalaryInput({ ...salaryInput, grossMonthly: event.target.value })} /></label>
                    <div className="tool-form-row">
                        <label>Monthly deductions<input type="number" min="0" step="0.01" value={salaryInput.deductionsMonthly} onChange={(event) => setSalaryInput({ ...salaryInput, deductionsMonthly: event.target.value })} /></label>
                        <label>Estimated tax (%)<input type="number" min="0" max="60" step="0.1" value={salaryInput.estimatedTaxRate} onChange={(event) => setSalaryInput({ ...salaryInput, estimatedTaxRate: event.target.value })} /></label>
                    </div>
                    <button className="button button-small" disabled={saving}>Calculate estimate</button>
                </form>
                {salaryEstimate && <section className="data-card salary-estimate"><h2>Estimated take-home</h2><strong>{new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(salaryEstimate.estimatedTakeHomeMonthly)}<small> / month</small></strong><p>Estimated annual take-home: {new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(salaryEstimate.estimatedTakeHomeAnnual)}</p><p>{salaryEstimate.note}</p></section>}
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
                <section className="data-card"><h2>{isManager ? "Business leave requests" : "Your leave requests"}</h2>{leaveRequests.length === 0 ? <p>No leave requests yet.</p> : <ul className="tool-list">{leaveRequests.map((item) => <li key={item._id}><div><strong>{item.userId?.name || item.title}</strong><span>{item.leaveType} · {displayDate(item.startsAt)} – {displayDate(item.endsAt)} · {item.status}</span>{item.description && <span>{item.description}</span>}</div>{isManager && item.status === "pending" && <div className="tool-actions"><button className="button button-small" disabled={saving} onClick={() => void runAction(() => decideToolLeave(item._id, "approved"), "Leave approved.")}>Approve</button><button className="button button-outline button-small" disabled={saving} onClick={() => void runAction(() => decideToolLeave(item._id, "rejected"), "Leave declined.")}>Decline</button></div>}</li>)}</ul>}</section>
            </>;
        }
        return <>
            {isManager && <form className="data-card tool-form" onSubmit={submitSignature}>
                <h2>Request a signature</h2>
                <label>Employee<select required value={signatureInput.employeeId} onChange={(event) => setSignatureInput({ ...signatureInput, employeeId: event.target.value })}><option value="">Choose employee</option>{members.filter((member) => member.role === "employee").map((member) => <option key={member._id} value={member._id}>{member.name} ({member.email})</option>)}</select></label>
                <label>Document title<input required maxLength={160} value={signatureInput.title} onChange={(event) => setSignatureInput({ ...signatureInput, title: event.target.value })} /></label>
                <label>Document text<textarea required maxLength={4000} rows={5} value={signatureInput.documentText} onChange={(event) => setSignatureInput({ ...signatureInput, documentText: event.target.value })} /></label>
                <button className="button button-small" disabled={saving}>Send signature request</button>
            </form>}
            <section className="data-card"><h2>{isManager ? "Requests you sent" : "Documents for your signature"}</h2>{documents.length === 0 ? <p>No signature requests yet.</p> : <ul className="tool-list">{documents.map((document) => <li key={document._id}><div><strong>{document.title}</strong><span>{document.userId?.name ? `For ${document.userId.name} · ` : ""}{document.status}{document.signedAt ? ` · Signed ${displayDate(document.signedAt)}` : ""}</span><p>{document.description}</p></div>{!isManager && document.status === "pending" && <div className="tool-actions"><input aria-label="Your full legal name" placeholder="Type your full name" value={signedName} onChange={(event) => setSignedName(event.target.value)} /><label className="signature-consent"><input type="checkbox" checked={signatureConsent} onChange={(event) => setSignatureConsent(event.target.checked)} />I agree this records my electronic acknowledgment.</label><button className="button button-small" disabled={saving || signedName.trim().length < 2 || !signatureConsent} onClick={() => void runAction(async () => { await signToolDocument(document._id, signedName.trim()); setSignatureConsent(false); }, "Document signed.")}>Sign</button></div>}</li>)}</ul>}</section>
        </>;
    };

    return <section className="tools-page">
        <header className="page-header"><div><p className="section-label">Personal workspace</p><h1>Work tools</h1><p>Plan your workload and keep meetings, leave, and signature tasks in one place.</p></div></header>
        <nav className="tool-tabs" aria-label="Work tools">{TABS.map(([key, label]) => <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)} aria-pressed={tab === key}>{label}</button>)}</nav>
        <FieldError>{error}</FieldError>
        {loading ? <Skeleton lines={5} /> : <div className="tools-content">{content()}</div>}
        <p className="tools-privacy"><Icon name="shield" size={18} /> Your salary inputs are not stored. Your planner and calendar entries are private to you; leave and signature workflows are business-scoped.</p>
    </section>;
}
