"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPassword, signupWithSession } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { Icon } from "./Icon";
import { FieldError } from "./UI";

function AuthShell({ children }) {
    return <main className="auth-split">
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
                <p>By continuing, you agree to the <Link href="/privacy">privacy policy</Link>. Work activity is summarized without recording screens or typed text.</p>
            </div>
        </section>
    </main>;
}

export function AuthForm({ initialMode = "signin" }) {
    const [formMode, setFormMode] = useState(initialMode);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [invitationCode, setInvitationCode] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { signIn, authenticated, hydrated } = useSubscription();
    const router = useRouter();
    const signingUp = formMode === "signup";

    useEffect(() => {
        if (hydrated && authenticated) router.replace("/dashboard");
    }, [hydrated, authenticated, router]);

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
            if (invitationCode.trim().length < 6) next.invitationCode = "Enter your invitation code.";
            if (password.length < 8) next.password = "Password must be at least 8 characters.";
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
                ? await signupWithSession({
                    name: `${firstName.trim()} ${lastName.trim()}`,
                    invitationCode: invitationCode.trim(),
                    password,
                })
                : await signInWithPassword({ email: email.trim(), password });
            signIn(user);
            router.push("/dashboard");
        } catch (error) {
            setErrors({ form: error instanceof Error ? error.message : "Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return <AuthShell>
        <img src="/Logo=green.png" alt="" className="auth-icon"/>
        <h1>{signingUp ? "Join your business" : "Welcome back!"}</h1>
        <p className="auth-intro">{signingUp
            ? "Accept your business invitation and create your account"
            : "Sign in with your work email and password."}</p>

        <form onSubmit={submit} noValidate>
            {signingUp ? <>
                <div className="field-row">
                    <label>First name<input value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" placeholder="eg. John"/><FieldError>{errors.firstName}</FieldError></label>
                    <label>Last name<input value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" placeholder="eg. Doe"/><FieldError>{errors.lastName}</FieldError></label>
                </div>
                <label>Invitation code<input value={invitationCode} onChange={(e) => setInvitationCode(e.target.value)} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="xxxx1234xx56"/><FieldError>{errors.invitationCode}</FieldError></label>
            </> : <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="name@company.com"/><FieldError>{errors.email}</FieldError></label>}

            <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={signingUp ? "new-password" : "current-password"} maxLength={128} placeholder="Enter your password"/><FieldError>{errors.password}</FieldError></label>

            {!signingUp && <p className="auth-forgot-link"><Link href="/forgot-password">Forgot password?</Link></p>}

            <FieldError>{errors.form}</FieldError>
            <button type="submit" className="button button-full auth-submit" disabled={loading}>
                {loading
                    ? <><span className="spinner"/>{signingUp ? "Creating account…" : "Signing in…"}</>
                    : signingUp ? "Create account" : "Sign in"}
            </button>
        </form>

        <p className="auth-account-switch">
            {signingUp ? "Already have an account?" : "Have an employee invite?"}
            <button type="button" onClick={() => switchFormMode(signingUp ? "signin" : "signup")}>{signingUp ? "Sign in" : "Join your business"}</button>
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