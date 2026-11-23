"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requestOtp, signInWithPassword, signupWithSession, verifyOtp } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { FieldError } from "./UI";

export function AuthForm({ initialMode = "signin" }) {
    const [formMode, setFormMode] = useState(initialMode);
    const [accountType, setAccountType] = useState("individual");
    const [signinMethod, setSigninMethod] = useState("email");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [notice, setNotice] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { signIn, authenticated, hydrated } = useSubscription();
    const router = useRouter();
    const signingUp = formMode === "signup";
    const accountLabel = accountType === "business" ? "Business" : "Employee";
    const trimmedEmail = email.trim();

    useEffect(() => {
        if (hydrated && authenticated) {
            router.replace("/dashboard");
        }
    }, [hydrated, authenticated, router]);

    useEffect(() => {
        if (!resendCountdown)
            return undefined;
        const timer = window.setTimeout(() => setResendCountdown((current) => Math.max(0, current - 1)), 1000);
        return () => window.clearTimeout(timer);
    }, [resendCountdown]);

    const switchFormMode = (mode) => {
        setFormMode(mode);
        setCodeSent(false);
        setVerificationCode("");
        setNotice("");
        setErrors({});
    };

    const selectAccountType = (type) => {
        setAccountType(type);
        if (codeSent) {
            setErrors({});
            return;
        }
        setCodeSent(false);
        setVerificationCode("");
        setNotice("");
        setErrors({});
    };

    const validateEmail = () => {
        if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
            setErrors({ email: "Enter a valid email address." });
            return false;
        }
        return true;
    };

    const sendEmailCode = async () => {
        if (!validateEmail())
            return;
        setLoading(true);
        setErrors({});
        setNotice("");
        try {
            const result = await requestOtp({
                email: trimmedEmail,
                channel: "email",
                purpose: "signin",
                accountType,
            });
            setCodeSent(true);
            setVerificationCode("");
            setResendCountdown(result?.resendAfterSeconds ?? 60);
            setNotice("If an active account matches this email, a code will arrive shortly. Check your spam folder if it does not arrive.");
        }
        catch (error) {
            setErrors({ form: error instanceof Error ? error.message : "Could not send a verification code. Please try again." });
        }
        finally {
            setLoading(false);
        }
    };

    const submit = async (event) => {
        event.preventDefault();
        if (!validateEmail())
            return;
        if (signingUp && name.trim().length < 2) {
            setErrors({ name: "Enter your name." });
            return;
        }
        if (signingUp && (!password || password.length < 8)) {
            setErrors({ password: "Password must be at least 8 characters." });
            return;
        }
        if (!signingUp && signinMethod === "password" && (!password || password.length < 8)) {
            setErrors({ password: "Enter your password." });
            return;
        }
        if (!signingUp && signinMethod === "email" && !codeSent) {
            await sendEmailCode();
            return;
        }
        if (!signingUp && signinMethod === "email" && !/^\d{6}$/.test(verificationCode)) {
            setErrors({ code: "Enter the six-digit code sent to your email." });
            return;
        }

        setLoading(true);
        setErrors({});
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
            const user = signinMethod === "password"
                ? await signInWithPassword({ email: trimmedEmail, password, accountType })
                : await verifyOtp({
                    email: trimmedEmail,
                    channel: "email",
                    purpose: "signin",
                    accountType,
                    code: verificationCode,
                });
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

    const resetEmailCode = () => {
        setCodeSent(false);
        setVerificationCode("");
        setResendCountdown(0);
        setNotice("");
        setErrors({});
    };

    return <main className="auth-page auth-page--account">
        <section className="auth-form-wrap">
            <div className="auth-form auth-form-card">
                <Logo inverse/>
                <p className="section-label">Your work. Your wellbeing.</p>
                <h1>{signingUp ? "Create your account." : "Welcome back."}</h1>
                <p className="auth-intro">{signingUp
                    ? accountType === "business"
                        ? "Create a Business account with your name, work email, and password."
                        : "Create an Employee account with your name, email, and password."
                    : `Sign in to your ${accountLabel} account using a secure email code or password.`}</p>

                <div className="segmented auth-role-selector" role="group" aria-label="Account type">
                    <button type="button" className={accountType === "individual" ? "active" : ""} aria-pressed={accountType === "individual"} onClick={() => selectAccountType("individual")}>Employee</button>
                    <button type="button" className={accountType === "business" ? "active" : ""} aria-pressed={accountType === "business"} onClick={() => selectAccountType("business")}>Business</button>
                </div>

                {signingUp && accountType === "business" && <p className="auth-form-note">Use a business email address. Gmail is accepted; Yahoo, Outlook, Hotmail, and similar providers are not.</p>}

                {!signingUp && <div className="auth-method-switch" role="group" aria-label="Sign-in method">
                    <button type="button" className={signinMethod === "email" ? "active" : ""} aria-pressed={signinMethod === "email"} onClick={() => { setSigninMethod("email"); resetEmailCode(); }}>Email code</button>
                    <button type="button" className={signinMethod === "password" ? "active" : ""} aria-pressed={signinMethod === "password"} onClick={() => { setSigninMethod("password"); resetEmailCode(); }}>Password</button>
                </div>}

                <form onSubmit={submit} noValidate>
                    {signingUp && <label>Full name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Alex Morgan"/><FieldError>{errors.name}</FieldError></label>}
                    <label>Email address<input type="email" value={email} onChange={(event) => { setEmail(event.target.value); if (codeSent) resetEmailCode(); }} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" disabled={codeSent && !signingUp}/><FieldError>{errors.email}</FieldError></label>

                    {signingUp || (!signingUp && signinMethod === "password")
                        ? <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={signingUp ? "new-password" : "current-password"} minLength={8} maxLength={128} placeholder={signingUp ? "At least 8 characters" : "Your password"}/><FieldError>{errors.password}</FieldError></label>
                        : codeSent && <label>Six-digit email code<input type="text" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="Enter your code" disabled={loading}/><FieldError>{errors.code}</FieldError></label>}

                    {notice && <p className="auth-form-notice" role="status">{notice}</p>}
                    <FieldError>{errors.form}</FieldError>
                    <button type="submit" className="button button-full auth-submit" disabled={loading}>
                        {loading
                            ? <><span className="spinner"/>{signingUp ? "Creating account…" : codeSent ? "Verifying…" : "Sending code…"}</>
                            : <>{signingUp ? "Create account" : signinMethod === "password" ? "Sign in" : codeSent ? "Verify and sign in" : "Send email code"}<Icon name="arrow"/></>}
                    </button>
                </form>

                {!signingUp && signinMethod === "email" && codeSent && <div className="auth-code-actions">
                    <button type="button" className="auth-inline-link" onClick={resetEmailCode}>Use a different email</button>
                    <button type="button" className="auth-inline-link" disabled={loading || resendCountdown > 0} onClick={sendEmailCode}>
                        {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : "Resend code"}
                    </button>
                </div>}
                {!signingUp && signinMethod === "password" && <p className="auth-forgot-link"><Link href="/forgot-password">Forgot password?</Link></p>}
                <p className="auth-account-switch">
                    {signingUp ? "Already have an account?" : "New to CalmWork?"}
                    <button type="button" onClick={() => switchFormMode(signingUp ? "signin" : "signup")}>{signingUp ? "Sign in" : "Create account"}</button>
                </p>
                <div className="auth-privacy"><Icon name="shield"/><p>By continuing, you agree to the <Link href="/privacy">privacy policy</Link>. Work activity is summarized without recording screens or typed text.</p></div>
            </div>
        </section>
    </main>;
}
