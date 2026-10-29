"use client";
import { FormEvent, useEffect, useState } from "react";
import { submitPulse } from "@/lib/api";
import { Icon } from "./Icon";
import { useToast } from "./Toast";
export function PulseForm() {
  const [mood, setMood] = useState(4); const [stress, setStress] = useState(2); const [workload, setWorkload] = useState(3); const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false); const [loading, setLoading] = useState(false); const toast = useToast();
  useEffect(() => setSubmitted(localStorage.getItem("pulse:pulseSubmitted") === "true"), []);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true); await submitPulse({ mood, stress, workload, comment });
    localStorage.setItem("pulse:pulseSubmitted", "true"); setSubmitted(true); setLoading(false); toast("Your anonymous pulse was submitted.");
  };
  if (submitted) return <section className="pulse-card submitted"><div className="success-mark"><Icon name="check" size={34}/></div><p className="section-label">Weekly pulse</p><h2>Submitted this week.</h2><p>Thank you for checking in. Your response is combined anonymously with your team’s.</p><button className="button button-outline" onClick={() => setSubmitted(false)}>Update response</button></section>;
  return <section className="pulse-card"><div className="card-heading"><div><p className="section-label">Weekly pulse</p><h2>How is work feeling?</h2></div><span className="anonymous-chip"><Icon name="shield" size={17}/>Anonymous</span></div><form onSubmit={submit}><fieldset className="mood-field"><legend>Your overall mood</legend><div className="mood-buttons">{[1,2,3,4,5].map((n) => <button type="button" key={n} className={mood === n ? "active" : ""} onClick={() => setMood(n)} aria-pressed={mood === n} aria-label={`Mood ${n} out of 5`}>{n}</button>)}</div><div className="range-labels"><span>Low</span><span>Great</span></div></fieldset><label className="slider-label"><span>Stress <strong>{stress}/5</strong></span><input type="range" min="1" max="5" value={stress} onChange={(e) => setStress(Number(e.target.value))}/><span className="range-labels"><small>Calm</small><small>Overwhelmed</small></span></label><label className="slider-label"><span>Workload <strong>{workload}/5</strong></span><input type="range" min="1" max="5" value={workload} onChange={(e) => setWorkload(Number(e.target.value))}/><span className="range-labels"><small>Light</small><small>Unsustainable</small></span></label><label>Anything you want to add? <span className="optional">Optional</span><textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share only what feels useful…" rows={3} maxLength={300}/></label><p className="form-note"><Icon name="shield" size={17}/>Managers see group averages only. Groups need at least 5 responses.</p><button className="button button-full" disabled={loading}>{loading ? "Submitting…" : "Submit anonymous pulse"}</button></form></section>;
}
