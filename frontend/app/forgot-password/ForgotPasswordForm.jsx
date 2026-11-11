"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { forgotPassword } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { FieldError } from "@/components/UI";
export function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const router = useRouter();
    const submit = async (event) => {
        event.preventDefault();
        const next = {};
        if (!/^\S+@\S+\.\S+$/.test(email))
            next.email = "Enter a valid work email.";
        setErrors(next);
        if (Object.keys(next).length)
            return;
        setLoading(true);
        try {
            await forgotPassword(email);
            setSent(true);
        }
        catch (error) {
            setErrors({ form: error instanceof Error ? error.message : "Could not send reset link. Try again." });
        }
        finally {
            setLoading(false);
        }
    };
    return (sent ? (
        <main className="page-main auth-page"><section className="auth-card"><div className="auth-stack"><Logo /><div className="auth-text"><h2>Check your inbox</h2><p>If an account exists for this email, a password reset link has been sent. Open the link to set a new password.</p></div><button className="button button-full" onClick={() => router.push("/login")}>Back to sign in<Icon name="arrow" /></button><p className="auth-note">No account? <Link href="/login?mode=signup">Create a business</Link></p></div></section></main>
    ) : (
        <main className="page-main auth-page"><section className="auth-card"><div className="auth-stack"><Logo /><form onSubmit={submit} noValidate><div className="auth-text"><h2>Forgot your password?</h2><p>Enter the work email on your CalmWork account. We’ll send a link to reset your password.</p></div><label>Work email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@company.com" /><FieldError>{errors.email}</FieldError></label><FieldError>{errors.form}</FieldError><button className="button button-full" disabled={loading}>{loading ? <><span className="spinner" />Sending…</> : <><span>Send reset link</span><Icon name="arrow" /></>}</button></form><p className="auth-note">Remember your password? <Link href="/login">Sign in</Link></p></div></section></main>
    ));
}
