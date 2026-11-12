"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/lib/subscription";
import { useTheme } from "@/lib/theme";
import { updateProfile } from "@/lib/api";
import { AppShell } from "./AppShell";
import { Modal } from "./UI";
import { Icon } from "./Icon";
import { useToast } from "./Toast";
function SettingsContent() {
    const { user, signIn, resetLocalPreferences } = useSubscription();
    const { theme, setTheme } = useTheme();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [threshold, setThreshold] = useState(5);
    const [weekly, setWeekly] = useState(true);
    const [idle, setIdle] = useState(true);
    const [product, setProduct] = useState(false);
    const [resetOpen, setResetOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const toast = useToast();
    const router = useRouter();
    useEffect(() => {
        if (!user)
            return;
        setName(user.name);
        setPhone(user.phone || "");
        setThreshold(user.settings.idleThresholdMinutes);
        setWeekly(user.settings.notifications.weeklyPulse);
        setIdle(user.settings.notifications.idlePrompt);
        setProduct(user.settings.notifications.productUpdates);
    }, [user]);
    const save = async (e) => {
        e.preventDefault();
        if (!user)
            return;
        setSaving(true);
        try {
            const { user: updated } = await updateProfile({
                name,
                phone: phone || null,
                settings: {
                    idleThresholdMinutes: threshold,
                    notifications: { weeklyPulse: weekly, idlePrompt: idle, productUpdates: product },
                },
            });
            signIn(updated);
            localStorage.setItem("calmwork:idleThreshold", String(threshold));
            window.dispatchEvent(new Event("calmwork:settings"));
            toast("Profile and preferences saved.");
        }
        catch (error) {
            toast(error instanceof Error ? error.message : "Could not save your settings.");
        }
        finally {
            setSaving(false);
        }
    };
    return <div className="settings-page">
        <div className="app-page-heading">
            <div>
                <p className="section-label">Your workspace</p>
                <h1>Settings</h1>
                <p>Personal preferences and privacy settings for {user?.name}.</p>
            </div>
        </div>
        <form onSubmit={save} className="settings-form">
            <section className="settings-section">
                <div><h2>Profile</h2><p>Your profile is tied to the account you signed in with.</p></div>
                <div className="settings-fields">
                    <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} required minLength={2}/></label>
                    <label>Work email<input type="email" value={user?.email || ""} readOnly/></label>
                    <label>Phone for optional SMS sign-in<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+14155550123" autoComplete="tel"/></label>
                </div>
            </section>
            <section className="settings-section">
                <div><h2>Appearance</h2><p>Choose the display that feels most comfortable. This preference is saved on this browser.</p></div>
                <div className="settings-fields">
                    <fieldset className="theme-picker">
                        <legend>Color theme</legend>
                        <div className="segmented" role="group" aria-label="Color theme">
                            <button type="button" className={theme === "light" ? "active" : ""} aria-pressed={theme === "light"} onClick={() => setTheme("light")}><Icon name="sun" size={18}/>Light</button>
                            <button type="button" className={theme === "dark" ? "active" : ""} aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}><Icon name="moon" size={18}/>Dark</button>
                        </div>
                    </fieldset>
                </div>
            </section>
            <section className="settings-section">
                <div><h2>Tracking</h2><p>Choose when CalmWork asks about inactive time.</p></div>
                <div className="settings-fields">
                    <label className="slider-label">
                        <span>Idle threshold <strong>{threshold} minutes</strong></span>
                        <input type="range" min="1" max="30" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}/>
                        <span className="range-labels"><small>1 minute</small><small>30 minutes</small></span>
                    </label>
                    <p className="form-note"><Icon name="clock" size={18}/>Mouse, keyboard, scroll, and touch activity reset the idle timer. Page visibility is also respected.</p>
                </div>
            </section>
            <section className="settings-section">
                <div><h2>Notifications</h2><p>Preferences are saved to your account.</p></div>
                <div className="settings-fields check-list">
                    <label><input type="checkbox" checked={weekly} onChange={(e) => setWeekly(e.target.checked)}/><span>Weekly pulse reminder</span></label>
                    <label><input type="checkbox" checked={idle} onChange={(e) => setIdle(e.target.checked)}/><span>Idle check-in prompt</span></label>
                    <label><input type="checkbox" checked={product} onChange={(e) => setProduct(e.target.checked)}/><span>Occasional product updates</span></label>
                </div>
            </section>
            <div className="settings-save"><button className="button" disabled={saving}>{saving ? "Saving…" : "Save settings"}</button></div>
        </form>
        <section className="settings-section privacy-settings">
            <div><h2>Privacy, in plain language</h2><p>What CalmWork does—and what is planned.</p></div>
            <div className="settings-fields privacy-list">
                <p><Icon name="check"/><span><strong>Current demo:</strong> session timing, active and idle duration, task labels, productivity tags, and voluntary pulse responses.</span></p>
                <p><Icon name="shield"/><span><strong>Planned screen recording:</strong> not active in this demo; any future recording will require employee opt-in and include pause and stop controls. Recordings can show visible screen content.</span></p>
                <p><Icon name="shield"/><span><strong>Optional keypress counts:</strong> when enabled, keydown event counts are stored only in this browser during active work sessions and erased when the session stops. Key values, typed characters, and text are never inspected or stored.</span></p>
                <p><Icon name="shield"/><span><strong>Manager view:</strong> current reports show workspace or team summaries. Access and retention for any future recordings must be defined and disclosed before rollout.</span></p>
            </div>
        </section>
        <section className="settings-section danger-zone">
            <div><h2>Reset local preferences</h2><p>Sign out and remove CalmWork preferences stored in this browser. Workspace activity remains saved to your account.</p></div>
            <div><button className="button button-danger" onClick={() => setResetOpen(true)}>Reset local preferences</button></div>
        </section>
        <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset local preferences?">
            <div className="modal-body">
                <p>This does not delete workspace records or your account.</p>
                <div className="modal-actions">
                    <button className="button button-outline" onClick={() => setResetOpen(false)}>Cancel</button>
                    <button className="button button-danger" onClick={async () => { await resetLocalPreferences(); router.push("/"); }}>Reset preferences</button>
                </div>
            </div>
        </Modal>
    </div>;
}
export function Settings() { return <AppShell><SettingsContent /></AppShell>; }
