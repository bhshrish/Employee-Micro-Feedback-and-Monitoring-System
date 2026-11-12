"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requestAdminOtp, verifyAdminOtp } from "@/lib/api";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { FieldError } from "./UI";

export function AdminLoginForm() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [requested, setRequested] = useState(false);
    const [resendIn, setResendIn] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (resendIn <= 0)
            return undefined;
        const timer = window.setTimeout(() => setResendIn((value) => Math.max(0, value - 1)), 1000);
        return () => window.clearTimeout(timer);
    }, [resendIn]);

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (!requested) {
                await requestAdminOtp(email);
                setRequested(true);
                setResendIn(60);
            }
            else {
                await verifyAdminOtp(email, code);
                router.push("/admin");
            }
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Admin verification failed.");
        }
        finally {
            setLoading(false);
        }
    };

    return <main className="admin-auth-page">
        <div className="admin-auth-card">
            <Logo inverse />
            <h1>Platform administrator sign in</h1>
            <p>{requested ? `Enter the one-time code sent to ${email}.` : "Use your administrator email to receive a secure one-time code."}</p>
            <form onSubmit={submit}>
                {!requested
                    ? <label>Administrator email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" autoCapitalize="none" /></label>
                    : <label>6-digit verification code<input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" required pattern="\d{6}" /></label>}
                <FieldError>{error}</FieldError>
                <button className="button button-full" disabled={loading}>{loading ? "Please wait…" : requested ? "Verify and continue" : "Email me a code"}<Icon name="arrow" /></button>
            </form>
            {requested && <div className="auth-mode-switch">
                <button type="button" disabled={resendIn > 0 || loading} onClick={() => { setRequested(false); setCode(""); setError(""); }}>
                    {resendIn > 0 ? `Request another code in ${resendIn}s` : "Request another code"}
                </button>
                <button type="button" disabled={loading} onClick={() => { setRequested(false); setCode(""); setError(""); }}>Change email</button>
            </div>}
            <p className="auth-text-switch"><Link href="/login">Return to employee or business sign in</Link></p>
        </div>
    </main>;
}
