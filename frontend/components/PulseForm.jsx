"use client";
import { useEffect, useState } from "react";
import { getPulseStatus, submitPulse } from "@/lib/api";
import { Icon } from "./Icon";
import { useToast } from "./Toast";
const QUESTIONS = [
    { key: "mood", prompt: "How would you rate your overall wellbeing at work this week?", choices: ["Very low", "Low", "Okay", "Good", "Great"] },
    { key: "stress", prompt: "How often have you felt stressed or under pressure at work?", choices: ["Never", "Rarely", "Sometimes", "Often", "Very often"] },
    { key: "exhaustion", prompt: "How often have you felt emotionally exhausted by your work?", choices: ["Never", "Rarely", "Sometimes", "Often", "Very often"] },
    { key: "workload", prompt: "How manageable has your workload felt?", choices: ["Very manageable", "Mostly manageable", "Somewhat manageable", "Difficult", "Unmanageable"] },
    { key: "recovery", prompt: "How well have you been able to recover your energy between workdays?", choices: ["Not at all", "A little", "Somewhat", "Mostly", "Fully"] },
    { key: "control", prompt: "How much control have you had over how you do your work?", choices: ["None", "A little", "Some", "A lot", "A great deal"] },
    { key: "support", prompt: "How supported have you felt when work has been difficult?", choices: ["Not at all", "A little", "Somewhat", "Mostly", "Very supported"] },
];
const COMPONENT_LABELS = [
    ["mood", "Wellbeing"],
    ["stress", "Stress"],
    ["exhaustion", "Emotional exhaustion"],
    ["workload", "Workload"],
    ["recovery", "Recovery"],
    ["control", "Control"],
    ["support", "Support"],
];
function BurnoutResult({ metrics }) {
    if (!metrics)
        return <p>Your check-in was recorded. Your score is not available for this earlier submission.</p>;
    const level = metrics.severity === "high" ? "High" : metrics.severity === "medium" ? "Elevated" : "Lower";
    return <div className="burnout-result" aria-live="polite">
        <div className="burnout-result-score">
            <div><span>Your burnout signal</span><strong>{metrics.score}<small>/100</small></strong></div>
            <span className={`burnout-result-level ${metrics.severity}`}>{level}</span>
        </div>
        <div className="burnout-result-track" role="meter" aria-label="Your burnout signal" aria-valuemin={0} aria-valuemax={100} aria-valuenow={metrics.score}>
            <span className={metrics.severity} style={{ width: `${metrics.score}%` }}/>
        </div>
        <ul className="burnout-result-components">
            {COMPONENT_LABELS.map(([key, label]) => <li key={key}><span>{label}</span><strong>{metrics.components[key]}/100</strong></li>)}
        </ul>
        <p>This is a private reflection aid based on your answers, not a medical assessment. Your personal score is only shown to you; managers see group results after the privacy minimum is met.</p>
    </div>;
}
export function PulseForm() {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const answeredCount = Object.keys(answers).length;
    useEffect(() => {
        let active = true;
        getPulseStatus().then((value) => {
            if (active) {
                const status = value;
                setSubmitted(status.submittedThisWeek);
                setMetrics(status.burnoutMetrics);
            }
        }).catch((error) => toast(error instanceof Error ? error.message : "Could not load check-in status."))
            .finally(() => {
            if (active)
                setLoading(false);
        });
        return () => { active = false; };
    }, [toast]);
    const submit = async (event) => {
        event.preventDefault();
        if (answeredCount !== QUESTIONS.length)
            return;
        setLoading(true);
        try {
            const result = await submitPulse(answers);
            setMetrics(result.burnoutMetrics);
            setSubmitted(true);
            toast("Your burnout check-in was scored and submitted.");
        }
        catch (error) {
            toast(error instanceof Error ? error.message : "Could not submit your check-in.");
        }
        finally {
            setLoading(false);
        }
    };
    if (submitted)
        return <section className="pulse-card submitted"><div className="success-mark"><Icon name="check" size={34}/></div><p className="section-label">Weekly burnout check-in</p><h2>Submitted this week.</h2><p>Thank you for taking a moment to reflect. Your personal result is private to you.</p><BurnoutResult metrics={metrics}/></section>;
    if (loading)
        return <section className="pulse-card"><p className="section-label">Weekly burnout check-in</p><h2>Checking your check-in status…</h2></section>;
    return <section className="pulse-card">
        <div className="card-heading">
            <div><p className="section-label">Weekly burnout check-in</p><h2>How has work felt this week?</h2></div>
            <span className="anonymous-chip"><Icon name="shield" size={17}/>Private</span>
        </div>
        <p className="pulse-intro">Answer all seven questions to get your personal burnout metrics. Each answer uses a 1–5 scale.</p>
        <form className="burnout-questionnaire" onSubmit={submit}>
            {QUESTIONS.map((question, index) => <fieldset className="burnout-question" key={question.key}>
                <legend><span>{String(index + 1).padStart(2, "0")}</span>{question.prompt}<b aria-hidden="true">*</b></legend>
                <div className="burnout-answer-options">
                    {question.choices.map((choice, index) => {
                const value = index + 1;
                const id = `burnout-${question.key}-${value}`;
                return <label className="burnout-answer" key={value} htmlFor={id}>
                            <input id={id} type="radio" name={question.key} value={value} required checked={answers[question.key] === value} onChange={() => setAnswers((current) => ({ ...current, [question.key]: value }))}/>
                            <span>{choice}</span>
                        </label>;
            })}
                </div>
            </fieldset>)}
            <div className="burnout-form-footer">
                <p className="form-note"><Icon name="shield" size={17}/>You can see your own result. Administrators only receive group-level results after at least five responses.</p>
                <span className="burnout-progress">{answeredCount} of {QUESTIONS.length} answered</span>
                <button className="button button-full" disabled={loading || answeredCount !== QUESTIONS.length}>{loading ? "Scoring…" : "Generate my burnout metrics"}</button>
            </div>
        </form>
    </section>;
}
