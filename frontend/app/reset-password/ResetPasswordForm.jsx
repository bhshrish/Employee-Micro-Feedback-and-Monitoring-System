"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { FieldError } from "@/components/UI";
export function ResetPasswordForm({ token }) {
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const router = useRouter();
    const submit = async (event) => {
        event.preventDefault();
        const next = {};
        if (!token)
            next.form = "Missing reset token. Use the link from your email.";
        if (password.length < 8)
            next.password = "Enter a password with at least 8 characters.";
        setErrors(next);
        if (Object.keys(next).length)
            return;
        setLoading(true);
        try {
            await resetPassword(token, password);
            setDone(true);
        }
        catch (error) {
            setErrors({ form: error instanceof Error ? error.message : "Could not reset password. The link may be expired or already used." });
        }
        finally {
            setLoading(false);
        }
    };
    if (!token) {
        return (<main className="page-main auth-page"><section className="auth-card"><div className="auth-stack"><Logo /><div className="auth-text"><h2>Reset password</h2><p>Your reset link is missing or invalid. <Link href="/login">Sign in</Link> or <Link href="/forgot-password">request a new link</Link>.</p></div></div></section></main>);
    }
    return (done ? (
        <main className="page-main auth-page"><section className="auth-card"><div className="auth-stack"><Logo /><div className="auth-text"><h2>Password reset</h2><p>Your password has been reset. You can now sign in with your new password.</p></div><button className="button button-full" onClick={() => router.push("/login")}>Sign in<Icon name="arrow" /></button></div></section></main>
    ) : (
        <main className="page-main auth-page"><section className="auth-card"><div className="auth-stack"><Logo /><form onSubmit={submit} noValidate><div className="auth-text"><h2>Set a new password</h2><p>Choose a new password for your CalmWork account.</p></div><label>New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" autoCapitalize="none" placeholder="At least 8 characters" /><FieldError>{errors.password}</FieldError></label><FieldError>{errors.form}</FieldError><button className="button button-full" disabled={loading}>{loading ? <><span className="spinner" />Resetting…</> : <><span>Reset password</span><Icon name="arrow" /></>}</button></form><p className="auth-note">Already have a password? <Link href="/login">Sign in</Link></p></div></section></main>
    ));
}
