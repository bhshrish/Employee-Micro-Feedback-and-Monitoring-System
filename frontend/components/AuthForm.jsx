"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInvitation, authenticate, signInOperationsAdmin, signOut } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { FieldError } from "./UI";

export function AuthForm() {
    const [accountType, setAccountType] = useState("employee");
    const [formMode, setFormMode] = useState("signin");
    const [name, setName] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [inviteToken, setInviteToken] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [accountCreated, setAccountCreated] = useState(false);
    const { signIn, selectPlan } = useSubscription();
    const router = useRouter();
    const signingUp = accountType === "business" && formMode === "signup";
    const joining = accountType === "employee" && formMode === "join";

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const plan = params.get("plan");
        const cycle = params.get("cycle");
        if (plan && ["Starter", "Team", "Business"].includes(plan))
            selectPlan(plan, cycle === "yearly" ? "yearly" : "monthly");
        if (params.get("mode") === "signup") {
            setAccountType("business");
            setFormMode("signup");
        }
        if (params.has("invite")) {
            setAccountType("employee");
            setFormMode("join");
            setInviteToken(params.get("invite") || "");
            setEmail(params.get("email") || "");
        }
    }, []);

    const chooseAccountType = (type) => {
        setAccountType(type);
        setFormMode("signin");
        setAccountCreated(false);
        setErrors({});
        setPassword("");
        if (type === "admin")
            setEmail("admin@gmail.com");
        else
            setEmail("");
    };

    const submit = async (event) => {
        event.preventDefault();
        const next = {};
        if ((signingUp || joining) && name.trim().length < 2)
            next.name = "Enter your name.";
        if (signingUp && businessName.trim().length < 2)
            next.businessName = "Enter your business name.";
        if (accountType !== "admin" && !/^\S+@\S+\.\S+$/.test(email))
            next.email = "Enter a valid work email.";
        if ((signingUp || joining || accountType === "admin") && password.length < 8)
            next.password = "Enter a password with at least 8 characters.";
        if (joining && inviteToken.trim().length < 32)
            next.inviteToken = "Use the invitation link provided by your business.";
        setErrors(next);
        if (Object.keys(next).length)
            return;

        setLoading(true);
        try {
            if (accountType === "admin") {
                await signInOperationsAdmin("admin", "admin@gmail.com", password);
                router.push("/admin");
                return;
            }
            if (joining) {
                await acceptInvitation({ token: inviteToken.trim(), email, name, password });
                setPassword("");
                setAccountCreated(true);
                return;
            }
            const user = await authenticate(email, password, signingUp ? "signup" : "signin", name, businessName);
            if (signingUp) {
                setPassword("");
                setErrors({});
                setAccountCreated(true);
                return;
            }
            const roleMatches = accountType === "business"
                ? user.role === "admin"
                : user.role === "employee" || user.role === "manager";
            if (!roleMatches) {
                await signOut();
                setErrors({ form: accountType === "business"
                    ? "This account belongs to an employee. Choose Employee sign in."
                    : "This account belongs to a business. Choose Business sign in." });
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

    const switchFormMode = (mode) => {
        setFormMode(mode);
        setAccountCreated(false);
        setErrors({});
        setPassword("");
    };

    const heading = accountCreated
        ? "Account created."
        : accountType === "admin"
            ? "Platform admin access."
            : joining
                ? "Join your business."
                : signingUp
                    ? "Create your business workspace."
                    : accountType === "business" ? "Business sign in." : "Employee sign in.";
    const description = accountCreated
        ? "Your account is ready. You are not signed in."
        : accountType === "admin"
            ? "Sign in to manage WellTrack businesses, users, attendance, teams, and privacy-safe activity summaries."
            : joining
                ? "Create your employee account using the invitation from your business."
                : signingUp
                    ? "Start a seven-day free trial. Your business workspace is created separately from sign-in."
                    : accountType === "business"
                        ? "Sign in to manage your business workspace and team."
                        : "Sign in with the email and password for your business account.";

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
                <div className="tabs access-type-tabs" role="tablist" aria-label="Account type">
                    {["employee", "business", "admin"].map((type) =>
                        <button key={type} role="tab" aria-selected={accountType === type}
                            className={accountType === type ? "active" : ""}
                            onClick={() => chooseAccountType(type)}>
                            {type === "admin" ? "Admin" : type[0].toUpperCase() + type.slice(1)}
                        </button>)}
                </div>
                {accountType === "business" && !accountCreated && <div className="auth-mode-switch" role="group" aria-label="Business account action">
                    <button className={formMode === "signin" ? "active" : ""} onClick={() => switchFormMode("signin")}>Sign in</button>
                    <button className={formMode === "signup" ? "active" : ""} onClick={() => switchFormMode("signup")}>Create business</button>
                </div>}
                {accountType === "employee" && !accountCreated && <button className="auth-text-switch" type="button" onClick={() => switchFormMode(joining ? "signin" : "join")}>
                    {joining ? "Back to employee sign in" : "Have an employee invitation? Create account"}
                </button>}
                <h2>{heading}</h2>
                <p>{description}</p>
                {!accountCreated && accountType !== "admin" && <p className="subtle-label">Email and password are case-sensitive. Enter them exactly as provided or created.</p>}
                {accountCreated ? <div role="status">
                    <p className="form-note">Your account has been created. Sign in when you are ready to open your workspace.</p>
                    <button className="button button-full" type="button" onClick={() => {
                        setAccountCreated(false);
                        setAccountType(joining ? "employee" : "business");
                        setFormMode("signin");
                    }}>Continue to sign in<Icon name="arrow" /></button>
                </div> : <form onSubmit={submit} noValidate>
                    {accountType === "admin" && <>
                        <label>Username<input value="admin" readOnly autoComplete="username"/></label>
                        <label>Work email<input type="email" value="admin@gmail.com" readOnly autoComplete="email"/></label>
                    </>}
                    {(signingUp || joining) && <label>Full name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Alex Morgan"/><FieldError>{errors.name}</FieldError></label>}
                    {signingUp && <label>Business name<input value={businessName} onChange={(event) => setBusinessName(event.target.value)} autoComplete="organization" maxLength={120} placeholder="Your company"/><FieldError>{errors.businessName}</FieldError></label>}
                    {accountType !== "admin" && <label>Work email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@company.com"/><FieldError>{errors.email}</FieldError></label>}
                    {joining && <label>Invitation code<input value={inviteToken} onChange={(event) => setInviteToken(event.target.value)} autoCapitalize="none" spellCheck={false}/><FieldError>{errors.inviteToken}</FieldError></label>}
                    <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={signingUp || joining ? "new-password" : "current-password"} autoCapitalize="none" placeholder={signingUp || joining ? "At least 8 characters" : "Password"}/><FieldError>{errors.password}</FieldError></label>
                    <FieldError>{errors.form}</FieldError>
                    <button className="button button-full" disabled={loading}>{loading
                        ? <><span className="spinner"/>{accountType === "admin" || formMode === "signin" ? "Signing in…" : "Creating account…"}</>
                        : <>{accountType === "admin" || formMode === "signin" ? "Sign in" : joining ? "Create employee account" : signingUp ? "Create business account" : "Sign in"}<Icon name="arrow"/></>}</button>
                </form>}
                <div className="auth-privacy"><Icon name="shield"/><p>By continuing, you agree to the <Link href="/privacy">privacy policy</Link>. Work activity is summarized without recording screens or typed text.</p></div>
            </div>
        </section>
    </main>;
}
