"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { requestPasswordReset, resetPassword } from "@/lib/api";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { FieldError } from "./UI";

export function PasswordRecoveryForm({ mode }) {
    const resetting = mode === "reset";
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (resetting)
            setToken(new URLSearchParams(window.location.search).get("token") || "");
    }, [resetting]);

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        if (resetting && !token) {
            setError("This reset link is invalid. Request a new password reset email.");
            return;
        }
        if (resetting && password !== confirmPassword) {
            setError("The passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            if (resetting) {
                await resetPassword({ token, password });
                setMessage("Your password has been reset. You can now sign in with your new password.");
            }
            else {
                const result = await requestPasswordReset(email);
                setMessage(result.message || "If an account exists for this email, a password reset link has been sent.");
            }
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Please try again.");
        }
        finally {
            setLoading(false);
        }
    };

    return <main className="password-recovery-page">
        <div className="password-recovery-card">
            <Logo />
            <h1>{resetting ? "Choose a new password" : "Reset your password"}</h1>
            <p>{resetting
                ? "Create a new password to secure your CalmWork account."
                : "Enter your work email and we’ll send a link to reset your password."}</p>
            {!message && <form onSubmit={submit} noValidate>
                {!resetting
                    ? <label>Work email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" autoCapitalize="none" required /></label>
                    : <>
                        <label>New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} maxLength={128} required /></label>
                        <label>Confirm new password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} maxLength={128} required /></label>
                    </>}
                <FieldError>{error}</FieldError>
                <button className="button button-full" disabled={loading}>{loading
                    ? <><span className="spinner"/>Please wait…</>
                    : <>{resetting ? "Reset password" : "Send reset link"}<Icon name="arrow"/></>}</button>
            </form>}
            {message && <p className="password-recovery-message" role="status">{message}</p>}
            {error && message && <FieldError>{error}</FieldError>}
            <p className="auth-text-switch"><Link href="/login">Return to sign in</Link></p>
        </div>
    </main>;
}
