"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticate, type BillingCycle, type PlanName } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { FieldError } from "./UI";

export function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string,string>>({}); const [loading, setLoading] = useState(false);
  const { signIn, signUp, selectPlan } = useSubscription(); const router = useRouter();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") setMode("signup");
    const plan = params.get("plan") as PlanName | null;
    const cycle = params.get("cycle") as BillingCycle | null;
    if (plan && ["Starter","Team","Business"].includes(plan)) selectPlan(plan, cycle === "yearly" ? "yearly" : "monthly");
  }, []);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); const next: Record<string,string> = {};
    if (mode === "signup" && name.trim().length < 2) next.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid work email.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next); if (Object.keys(next).length) return;
    setLoading(true);
    try { await authenticate(email, password, mode); mode === "signup" ? signUp() : signIn(); router.push("/dashboard"); }
    catch (error) { setErrors({ form: error instanceof Error ? error.message : "Please try again." }); }
    finally { setLoading(false); }
  };
  return <main className="auth-page"><section className="auth-story"><Logo inverse/><div><p className="section-label">Your work. Your wellbeing.</p><h1>A calmer way<br/>to know how<br/>work feels.</h1><p>Private personal insights. Anonymous team signals. No screen surveillance.</p></div><span>Demo workspace · Data stays in this browser</span></section><section className="auth-form-wrap"><div className="auth-mobile-logo"><Logo/></div><div className="auth-form"><div className="tabs" role="tablist" aria-label="Account access"><button role="tab" aria-selected={mode === "signin"} className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>Sign in</button><button role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Create account</button></div><h2>{mode === "signin" ? "Welcome back." : "Start your free trial."}</h2><p>{mode === "signin" ? "Use any valid email and an 8-character password for this demo." : "Seven days of full access. No credit card required."}</p><form onSubmit={submit} noValidate>{mode === "signup" && <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Alex Morgan" aria-describedby="name-error"/><FieldError>{errors.name}</FieldError></label>}<label>Work email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@company.com" aria-describedby="email-error"/><FieldError>{errors.email}</FieldError></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder="At least 8 characters" aria-describedby="password-error"/><FieldError>{errors.password}</FieldError></label><FieldError>{errors.form}</FieldError><button className="button button-full" disabled={loading}>{loading ? <><span className="spinner"/>Opening your workspace…</> : <>{mode === "signin" ? "Sign in to PULSE" : "Start 7 days free"}<Icon name="arrow"/></>}</button></form><div className="auth-privacy"><Icon name="shield"/><p>By continuing, you agree to the <Link href="/privacy">privacy policy</Link>. This is a simulated login; no account is created on a server.</p></div></div></section></main>;
}
