"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPassword, signupWithSession } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { FieldError } from "./UI";
export function AuthForm({ initialMode = "signin" }) {
    const [formMode, setFormMode] = useState(initialMode);
    const [accountType, setAccountType] = useState("individual");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { signIn, authenticated, hydrated } = useSubscription();
    const router = useRouter();
    const signingUp = formMode === "signup";
    const submitLabel = signingUp ? "Create account" : "Sign in";
    const loadingLabel = signingUp ? "Creating account…" : "Signing in…";
    useEffect(() => {
        if (hydrated && authenticated) {
            router.replace("/dashboard");
        }
    }, [hydrated, authenticated, router]);
    const switchFormMode = (mode) => {
        setFormMode(mode);
        setErrors({});
    };
    const submit = async (event) => {
        event.preventDefault();
        const next = {};
        const trimmedEmail = email.trim();
        if (!/^\S+@\S+\.\S+$/.test(trimmedEmail))
            next.email = "Enter a valid email address.";
        if (!password || password.length < 8)
            next.password = "Password must be at least 8 characters.";
        if (signingUp && name.trim().length < 2)
            next.name = "Enter your name.";
        setErrors(next);
        if (Object.keys(next).length)
            return;
        setLoading(true);
        try {
            if (signingUp) {
                const user = await signupWithSession({
                    name: name.trim(),
                    email: trimmedEmail,
                    password,
                    accountType,
                });
                signIn(user);
                router.push("/dashboard");
                return;
            }
            const user = await signInWithPassword({ email: trimmedEmail, password, accountType });
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
            <Logo inverse/>
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
                <h2>{signingUp ? "Create your account." : "Welcome back."}</h2>
                <p>{signingUp
            ? accountType === "business"
                ? "Create a Business account with your name, work email, and password."
                : "Create an Individual account with your name, email, and password."
            : `Sign in to your ${accountType === "business" ? "Business" : "Individual"} account.`}</p>
                <p className="subtle-label">Use a password with at least 8 characters.</p>
                <div className="segmented auth-role-selector" role="group" aria-label="Account type">
                    <button type="button" className={accountType === "individual" ? "active" : ""} aria-pressed={accountType === "individual"} onClick={() => setAccountType("individual")}>Individual</button>
                    <button type="button" className={accountType === "business" ? "active" : ""} aria-pressed={accountType === "business"} onClick={() => setAccountType("business")}>Business</button>
                    <button type="button" onClick={() => router.push("/admin/login")}>Admin</button>
                </div>
                {signingUp && accountType === "business" && <p className="form-note">Use a business email address. Gmail is accepted; Yahoo, Outlook, Hotmail, and similar providers are not.</p>}
                <form onSubmit={submit} noValidate>
                    {signingUp && <label>Full name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Alex Morgan"/><FieldError>{errors.name}</FieldError></label>}
                    <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com"/><FieldError>{errors.email}</FieldError></label>
                    <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={signingUp ? "new-password" : "current-password"} minLength={8} maxLength={128} placeholder="At least 8 characters"/><FieldError>{errors.password}</FieldError></label>
                    <FieldError>{errors.form}</FieldError>
                    <button type="submit" className="button button-full" disabled={loading}>{loading
            ? <><span className="spinner"/>{loadingLabel}</>
            : <>{submitLabel}<Icon name="arrow"/></>}</button>
                </form>
                {!signingUp && <p className="auth-forgot-link"><Link href="/forgot-password">Forgot password?</Link></p>}
                <p className="auth-account-switch">
                    {signingUp
            ? "Already have an account?"
            : "New to CalmWork?"}
                    <button type="button" onClick={() => switchFormMode(signingUp ? "signin" : "signup")}>
                        {signingUp
            ? "Sign in"
            : "Create account"}
                    </button>
                </p>
                <p className="auth-text-switch"><Link href="/admin/login">Platform administrator sign in</Link></p>
                <div className="auth-privacy"><Icon name="shield"/><p>By continuing, you agree to the <Link href="/privacy">privacy policy</Link>. Work activity is summarized without recording screens or typed text.</p></div>
            </div>
        </section>
    </main>;
}
