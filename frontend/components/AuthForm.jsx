"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticate, requestEmployeeOtp, signInOperationsAdmin, verifyEmployeeOtp } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { FieldError } from "./UI";
export function AuthForm() {
    const [mode, setMode] = useState("employee");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [otpRequested, setOtpRequested] = useState(false);
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
        if (mode === "signup" && password.length < 8)
            next.password = "Use at least 8 characters.";
        if (mode === "admin" && !password)
            next.password = "Enter the operations admin password.";
        if (mode === "employee" && otpRequested && !/^\d{6}$/.test(code))
            next.code = "Enter the 6-digit code from your email.";
        setErrors(next);
        if (Object.keys(next).length)
            return;
        setLoading(true);
        try {
            if (mode === "admin") {
                await signInOperationsAdmin(email, password);
                router.push("/admin");
                return;
            }
            if (mode === "employee" && !otpRequested) {
                await requestEmployeeOtp(email);
                setOtpRequested(true);
                setErrors({});
                return;
            }
            if (mode === "employee") {
                const user = await verifyEmployeeOtp(email, code);
                signIn(user);
                router.push("/dashboard");
                return;
            }
            const user = await authenticate(email, password, "signup", name);
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
    const selectMode = (nextMode) => {
        setMode(nextMode);
        setAccountCreated(false);
        setOtpRequested(false);
        setCode("");
        setPassword("");
        setErrors({});
        if (nextMode === "admin")
            setEmail("admin@gmail.com");
        else if (mode === "admin")
            setEmail("");
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
                    <button role="tab" aria-selected={mode === "employee"} className={mode === "employee" ? "active" : ""} onClick={() => selectMode("employee")}>Employee</button>
                    <button role="tab" aria-selected={mode === "admin"} className={mode === "admin" ? "active" : ""} onClick={() => selectMode("admin")}>Operations admin</button>
                    <button role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "active" : ""} onClick={() => selectMode("signup")}>Create account</button>
                </div>
                <h2>{accountCreated ? "Account created." : mode === "admin" ? "Operations access." : mode === "employee" ? otpRequested ? "Check your email." : "Employee sign in." : "Start your free trial."}</h2>
                <p>{accountCreated ? "Your account is ready. You are not signed in." : mode === "admin" ? "Sign in to the Workwell operations dashboard." : mode === "employee" ? otpRequested ? `Enter the 6-digit sign-in code sent to ${email}.` : "Use your work email to receive a secure sign-in code." : "Seven days of full access. No credit card required."}</p>
                {!accountCreated && mode === "signup" && <p className="subtle-label">Email and password are case-sensitive. Enter them exactly as you did when creating your account.</p>}
                {accountCreated ? <div role="status">
                    <p className="form-note">Your account has been created. Sign in when you are ready to open your workspace.</p>
                    <button className="button button-full" type="button" onClick={() => selectMode("employee")}>
                        Sign in to Workwell<Icon name="arrow" />
                    </button>
                </div> : <form onSubmit={submit} noValidate>
                    {mode === "signup" && <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Alex Morgan" aria-describedby="name-error" /><FieldError>{errors.name}</FieldError></label>}
                    {!(mode === "employee" && otpRequested) && <label>{mode === "admin" ? "Admin email" : "Work email"}<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} readOnly={mode === "admin"} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@company.com" aria-describedby="email-error" /><FieldError>{errors.email}</FieldError></label>}
                    {mode === "employee" && otpRequested && <label>6-digit email code<input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" aria-describedby="code-error" /><FieldError>{errors.code}</FieldError></label>}
                    {(mode === "admin" || mode === "signup") && <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "admin" ? "current-password" : "new-password"} autoCapitalize="none" placeholder={mode === "admin" ? "Operations admin password" : "At least 8 characters"} aria-describedby="password-error" /><FieldError>{errors.password}</FieldError></label>}
                    <FieldError>{errors.form}</FieldError>
                    <button className="button button-full" disabled={loading}>{loading ? <><span className="spinner" />{mode === "admin" ? "Signing in…" : mode === "signup" ? "Creating your account…" : otpRequested ? "Verifying code…" : "Sending code…"}</> : <>{mode === "admin" ? "Sign in as admin" : mode === "signup" ? "Create account" : otpRequested ? "Verify and sign in" : "Send sign-in code"}<Icon name="arrow" /></>}</button>
                    {mode === "employee" && otpRequested && <button className="button button-quiet" type="button" onClick={() => { setOtpRequested(false); setCode(""); setErrors({}); }}>Use a different email</button>}
                </form>}
                <div className="auth-privacy"><Icon name="shield" /><p>Employee sign-in uses an emailed one-time code. Admin sign-in is restricted to the configured operations account. Your account and session are managed securely by Workwell.</p></div>
            </div>
        </section>
    </main>;
}
