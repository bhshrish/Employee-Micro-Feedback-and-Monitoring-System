"use client";
import { FormEvent, useEffect, useState } from "react";
import { getPulseStatus, submitPulse } from "@/lib/api";
import { Icon } from "./Icon";
import { useToast } from "./Toast";
export function PulseForm() {
  const [mood, setMood] = useState(4); const [stress, setStress] = useState(2); const [workload, setWorkload] = useState(3);
  const [submitted, setSubmitted] = useState(false); const [loading, setLoading] = useState(true); const toast = useToast();
  useEffect(() => {
    let active = true;
    getPulseStatus().then((value) => { if (active) setSubmitted(value); })
      .catch((error: unknown) => toast(error instanceof Error ? error.message : "Could not load pulse status."))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [toast]);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await submitPulse({ mood, stress, workload });
      setSubmitted(true); toast("Your anonymous pulse was submitted.");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not submit your pulse.");
    } finally { setLoading(false); }
  };
  if (submitted) return <section className="pulse-card submitted"><div className="success-mark"><Icon name="check" size={34}/></div><p className="section-label">Weekly pulse</p><h2>Submitted this week.</h2><p>Thank you for checking in. Your response is combined anonymously with your team’s.</p></section>;
  if (loading) return <section className="pulse-card"><p className="section-label">Weekly pulse</p><h2>Checking your pulse status…</h2></section>;
  return <section className="pulse-card"><div className="card-heading"><div><p className="section-label">Weekly pulse</p><h2>How is work feeling?</h2></div><span className="anonymous-chip"><Icon name="shield" size={17}/>Anonymous</span></div><form onSubmit={submit}><fieldset className="mood-field"><legend>Your overall mood</legend><div className="mood-buttons">{[1,2,3,4,5].map((n) => <button type="button" key={n} className={mood === n ? "active" : ""} onClick={() => setMood(n)} aria-pressed={mood === n} aria-label={`Mood ${n} out of 5`}>{n}</button>)}</div><div className="range-labels"><span>Low</span><span>Great</span></div></fieldset><label className="slider-label"><span>Stress <strong>{stress}/5</strong></span><input type="range" min="1" max="5" value={stress} onChange={(e) => setStress(Number(e.target.value))}/><span className="range-labels"><small>Calm</small><small>Overwhelmed</small></span></label><label className="slider-label"><span>Workload <strong>{workload}/5</strong></span><input type="range" min="1" max="5" value={workload} onChange={(e) => setWorkload(Number(e.target.value))}/><span className="range-labels"><small>Light</small><small>Unsustainable</small></span></label><p className="form-note"><Icon name="shield" size={17}/>Only ratings are saved; no personal comments are collected. Managers see groups of at least five responses.</p><button className="button button-full" disabled={loading}>{loading ? "Submitting…" : "Submit anonymous pulse"}</button></form></section>;
}
