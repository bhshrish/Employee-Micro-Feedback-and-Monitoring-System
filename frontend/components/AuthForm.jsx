"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticate } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { FieldError } from "./UI";
export function AuthForm() {
    const [mode, setMode] = useState("signin");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [accountCreated, setAccountCreated] = useState(false);
    const { signIn, selectPlan } = useSubscription();
    const router = useRouter();
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("mode") === "signup")
            setMode("signup");
        const plan = params.get("plan");
        const cycle = params.get("cycle");
        if (plan && ["Starter", "Team", "Business"].includes(plan))
            selectPlan(plan, cycle === "yearly" ? "yearly" : "monthly");
    }, []);
    const submit = async (e) => {
        e.preventDefault();
        const next = {};
        if (mode === "signup" && name.trim().length < 2)
            next.name = "Enter your name.";
        if (!/^\S+@\S+\.\S+$/.test(email))
            next.email = "Enter a valid work email.";
        if (password.length < 8)
            next.password = "Use at least 8 characters.";
        setErrors(next);
        if (Object.keys(next).length)
            return;
        setLoading(true);
        try {
            const user = await authenticate(email, password, mode, name);
            if (mode === "signup") {
                setPassword("");
                setErrors({});
                setAccountCreated(true);
                return;
            }
            signIn(user);
            router.push("/dashboard");
        }
        catch (error) {
            setErrors({ form: error instanceof Error ? error.message : "Please try again." });
        }
        finally {
            setLoading(false);
        }
    };
    return <main className="auth-page">
        <section className="auth-story">
            <Logo inverse />
            <div>
                <p className="section-label">Your work. Your wellbeing.</p>
                <h1>A calmer way<br />to know how<br />work feels.</h1>
                <p>Private personal insights. Anonymous team signals. No screen surveillance.</p>
            </div>
            <span>Your workspace is protected by secure account access.</span>
        </section>
        <section className="auth-form-wrap">
            <div className="auth-mobile-logo"><Logo /></div>
            <div className="auth-form">
                <div className="tabs" role="tablist" aria-label="Account access">
                    <button role="tab" aria-selected={mode === "signin"} className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setAccountCreated(false); setErrors({}); }}>Sign in</button>
                    <button role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setAccountCreated(false); setErrors({}); }}>Create account</button>
                </div>
                <h2>{accountCreated ? "Account created." : mode === "signin" ? "Welcome back." : "Start your free trial."}</h2>
                <p>{accountCreated ? "Your account is ready. You are not signed in." : mode === "signin" ? "Sign in to your PULSE workspace." : "Seven days of full access. No credit card required."}</p>
                {accountCreated ? <div role="status">
                    <p className="form-note">Your account has been created. Sign in when you are ready to open your workspace.</p>
                    <button className="button button-full" type="button" onClick={() => { setMode("signin"); setAccountCreated(false); }}>
                        Sign in to PULSE<Icon name="arrow" />
                    </button>
                </div> : <form onSubmit={submit} noValidate>
                    {mode === "signup" && <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Alex Morgan" aria-describedby="name-error" /><FieldError>{errors.name}</FieldError></label>}
                    <label>Work email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@company.com" aria-describedby="email-error" /><FieldError>{errors.email}</FieldError></label>
                    <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder="At least 8 characters" aria-describedby="password-error" /><FieldError>{errors.password}</FieldError></label>
                    <FieldError>{errors.form}</FieldError>
                    <button className="button button-full" disabled={loading}>{loading ? <><span className="spinner" />{mode === "signin" ? "Signing you in…" : "Creating your account…"}</> : <>{mode === "signin" ? "Sign in to PULSE" : "Create account"}<Icon name="arrow" /></>}</button>
                </form>}
                <div className="auth-privacy"><Icon name="shield" /><p>By continuing, you agree to the <Link href="/privacy">privacy policy</Link>. Your account and session are managed securely by PULSE.</p></div>
            </div>
        </section>
    </main>;
}
