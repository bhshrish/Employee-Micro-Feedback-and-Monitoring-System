"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { completeOAuthSignIn, getOAuthUrl, signInWithPassword, signupWithSession } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { Icon } from "./Icon";
import { FieldError } from "./UI";

function AuthShell({ children, variant }) {
    const signingUp = variant === "auth-signup";
    return <main className={`auth-split ${variant}`}>
        <aside className="auth-hero">
            <img src="/Logo=workmark2.png" alt="CalmWork" className="auth-hero-logo"/>
            <p className="auth-hero-label">Your work. Your wellbeing.</p>
            <h2 className="auth-hero-title">A <em>calmer</em> way to know how work feels.</h2>
            <ul className="auth-hero-points">
                <li>Private personal insights</li>
                <li>Anonymous team signals</li>
                <li>No screen surveillance</li>
            </ul>
        </aside>
        <section className="auth-panel">
            <div className="auth-form">{children}</div>
            <div className="auth-privacy">
                <Icon name="shield"/>
                <p>
                    <strong>{signingUp ? "Your privacy matters." : "Private by design."}</strong>
                    {signingUp
                        ? <> By creating an account, you agree to our <Link href="/privacy">Privacy Policy</Link>. Wellbeing check-ins are reported in aggregate, and small groups are suppressed.</>
                        : <> Read our <Link href="/privacy">Privacy Policy</Link>. CalmWork does not record screens, keystrokes, or typed text.</>}
                </p>
            </div>
        </section>
    </main>;
}

export function AuthForm({ initialMode = "signin" }) {
    const [formMode, setFormMode] = useState(initialMode);
    const [accountRole, setAccountRole] = useState("employee");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [invitationCode, setInvitationCode] = useState("");
    const [organizationName, setOrganizationName] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOAuthLoading] = useState("");
    const oauthHandled = useRef(false);
    const { signIn, authenticated, hydrated } = useSubscription();
    const router = useRouter();
    const signingUp = formMode === "signup";

    useEffect(() => {
        if (hydrated && authenticated) router.replace("/dashboard");
    }, [hydrated, authenticated, router]);

    useEffect(() => {
        if (oauthHandled.current)
            return;
        const query = new URLSearchParams(window.location.search);
        const oauthError = query.get("oauth_error");
        const oauthProvider = query.get("oauth_provider");
        if (query.get("oauth") !== "success" && !oauthError)
            return;
        oauthHandled.current = true;
        window.history.replaceState({}, "", window.location.pathname);
        if (oauthError) {
            const providerName = "Google";
            const messages = {
                cancelled: "Sign-in was canceled.",
                not_configured: `${providerName} sign-in is not configured for this deployment. Use email and password instead.`,
                rejected: `Unable to verify your ${providerName} sign-in. Make sure the provider account is linked to an employee account.`,
                failed: `${providerName} sign-in could not be completed. Please try again.`,
            };
            Promise.resolve().then(() => {
                setErrors({ form: messages[oauthError] || "Sign-in could not be completed. Please try again." });
            });
            return;
        }
        Promise.resolve()
            .then(() => {
                setOAuthLoading(oauthProvider || "provider");
                return completeOAuthSignIn();
            })
            .then((user) => {
                signIn(user);
                router.replace("/dashboard");
            })
            .catch((error) => {
                setErrors({ form: error instanceof Error ? error.message : "Unable to complete sign-in. Please try again." });
            })
            .finally(() => setOAuthLoading(""));
    }, [router, signIn]);

    const switchFormMode = (mode) => {
        setFormMode(mode);
        setErrors({});
        setPassword("");
    };

    const validate = () => {
        const next = {};
        if (signingUp) {
            if (firstName.trim().length < 1) next.firstName = "Enter your first name.";
            if (lastName.trim().length < 1) next.lastName = "Enter your last name.";
            if (accountRole === "business") {
                if (organizationName.trim().length < 2) next.organizationName = "Enter your organization name.";
                if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid business email.";
                if (password.length < 8) next.password = "Password must be at least 8 characters.";
            } else {
                if (invitationCode.trim().length < 6) next.invitationCode = "Enter your invitation code.";
                if (password.length < 8) next.password = "Password must be at least 8 characters.";
            }
        } else {
            if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address.";
            if (!password) next.password = "Enter your password.";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const submit = async (event) => {
        event.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setErrors({});
        try {
            const user = signingUp
                ? accountRole === "business"
                    ? await signupWithSession({
                        name: `${firstName.trim()} ${lastName.trim()}`,
                        email: email.trim(),
                        password,
                        accountType: "business",
                        organizationName: organizationName.trim(),
                    })
                    : await signupWithSession({
                        name: `${firstName.trim()} ${lastName.trim()}`,
                        invitationCode: invitationCode.trim(),
                        password,
                    })
                : await signInWithPassword({
                    email: email.trim(),
                    password,
                    ...(accountRole === "business" ? { accountType: "business" } : {}),
                });
            signIn(user);
            router.push("/dashboard");
        } catch (error) {
            setErrors({ form: error instanceof Error ? error.message : "Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const roleToggle = <div className="auth-role-toggle" role="group" aria-label="Account type">
        <button type="button" className={accountRole === "employee" ? "active" : ""} aria-pressed={accountRole === "employee"} onClick={() => setAccountRole("employee")}>Employee</button>
        <button type="button" className={accountRole === "business" ? "active" : ""} aria-pressed={accountRole === "business"} onClick={() => setAccountRole("business")}>Business</button>
    </div>;

    return <AuthShell variant={signingUp ? "auth-signup" : "auth-signin"}>
        {roleToggle}
        {signingUp && <img src="/Logo=green.png" alt="" className="auth-icon"/>}
        <h1>{signingUp
            ? accountRole === "business" ? "Create your business account" : "Join your business"
            : accountRole === "business" ? "Business sign in" : "Welcome back!"}</h1>
        <p className="auth-intro">{signingUp
            ? accountRole === "business"
                ? "Set up your organization and start your 14-day free trial."
                : "Accept your business invitation and create your account"
            : accountRole === "business"
                ? "Sign in to manage your business workspace."
                : "Sign in with your work email and password."}</p>

        <form onSubmit={submit} noValidate>
            {signingUp && accountRole === "business" ? <>
                <div className="field-row">
                    <label>First name<input value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" placeholder="eg. Alex" required/><FieldError>{errors.firstName}</FieldError></label>
                    <label>Last name<input value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" placeholder="eg. Morgan" required/><FieldError>{errors.lastName}</FieldError></label>
                </div>
                <label>Organization name<input value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} autoComplete="organization" placeholder="eg. Acme Inc." required/><FieldError>{errors.organizationName}</FieldError></label>
                <label>Business email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@company.com" required/><FieldError>{errors.email}</FieldError></label>
            </> : signingUp ? <>
                <div className="field-row">
                    <label>First name<input value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" placeholder="eg. John"/><FieldError>{errors.firstName}</FieldError></label>
                    <label>Last name<input value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" placeholder="eg. Doe"/><FieldError>{errors.lastName}</FieldError></label>
                </div>
                <label>Invitation code<input value={invitationCode} onChange={(e) => setInvitationCode(e.target.value)} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="xxxx1234xx56"/><FieldError>{errors.invitationCode}</FieldError></label>
            </> : <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="name@company.com"/><FieldError>{errors.email}</FieldError></label>}

            <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={signingUp ? "new-password" : "current-password"} maxLength={128} placeholder="Enter your password" required/><FieldError>{errors.password}</FieldError></label>

            {!signingUp && <p className="auth-forgot-link"><Link href="/forgot-password">Forgot password?</Link></p>}

            <FieldError>{errors.form}</FieldError>
            <button type="submit" className="button button-full auth-submit" disabled={loading}>
                {loading
                    ? <><span className="spinner"/>{signingUp ? "Creating account…" : "Signing in…"}</>
                    : signingUp ? accountRole === "business" ? "Create business account" : "Create account" : accountRole === "business" ? "Sign in to business" : "Sign in"}
            </button>
        </form>

        {!signingUp && accountRole === "employee" && <div className="auth-social-login">
            <div className="auth-social-divider"><span/>or<span/></div>
            <div className="auth-social-buttons">
                <button type="button" className="auth-social-button" disabled={loading || Boolean(oauthLoading)} onClick={() => {
                    setOAuthLoading("google");
                    window.location.assign(getOAuthUrl("google"));
                }}>
                    <svg aria-hidden="true" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.23c0-.72-.06-1.42-.18-2.09H12v3.95h5.38a4.6 4.6 0 0 1-2 3.02v2.56h3.24c1.9-1.75 2.98-4.33 2.98-7.44Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.56c-.9.6-2.03.96-3.38.96-2.6 0-4.8-1.76-5.59-4.13H3.06v2.64A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.84a6 6 0 0 1 0-3.68V7.52H3.06a10 10 0 0 0 0 8.96l3.35-2.64Z"/><path fill="#EA4335" d="M12 6.03c1.47 0 2.79.5 3.83 1.52l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.52l3.35 2.64C7.2 7.79 9.4 6.03 12 6.03Z"/></svg>
                    Google
                </button>
            </div>
            {oauthLoading && <p className="auth-social-status" role="status">Connecting to Google…</p>}
        </div>}

        <p className="auth-account-switch">
            {signingUp ? "Already have an account?" : accountRole === "business" ? "New to CalmWork?" : "Have an employee invite?"}
            <button type="button" onClick={() => switchFormMode(signingUp ? "signin" : "signup")}>{signingUp ? "Sign in" : accountRole === "business" ? "Create business account" : "Join your business"}</button>
        </p>
    </AuthShell>;
}

// Reset password screen. Use it in app/forgot-password/page.tsx
export function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            setError("Enter a valid email address.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await requestPasswordReset({ email: email.trim() }); // add to lib/api
            setSent(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return <main className="reset-page">
        <img src="/Logo_workmark3.png" alt="CalmWork" className="reset-logo"/>
        <div className="reset-card">
            <Link href="/login" className="reset-back"><Icon name="back" size={18}/>Back to sign in</Link>
            <h1><span>Reset your</span><strong>Password</strong></h1>
            <p>Enter your work email and we’ll send a link to reset your password.</p>
            <form onSubmit={submit} noValidate>
                <label>Enter your email
                    <div className="reset-input">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false}/>
                        <button type="submit" disabled={loading} aria-label="Send reset link"><Icon name="arrow" size={22}/></button>
                    </div>
                </label>
                {error && <p className="reset-error" role="alert">{error}</p>}
                {sent && <p className="reset-notice" role="status">If an account matches this email, a reset link is on its way.</p>}
            </form>
        </div>
    </main>;
};