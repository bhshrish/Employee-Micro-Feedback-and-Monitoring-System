"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { verifyEmailChange } from "@/lib/api";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { FieldError } from "./UI";

export function EmailChangeVerification() {
    const [token, setToken] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setToken(new URLSearchParams(window.location.search).get("token") || "");
    }, []);

    const verify = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const result = await verifyEmailChange(token);
            setMessage(result.message || "Your email address has been verified and updated.");
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not verify this email address.");
        }
        finally {
            setLoading(false);
        }
    };

    return <main className="password-recovery-page">
        <div className="password-recovery-card">
            <Logo />
            <h1>Verify your email address</h1>
            <p>Confirm this address to use it for signing in to CalmWork.</p>
            {!message && <form onSubmit={verify} noValidate>
                <FieldError>{error || (!token ? "This verification link is missing or invalid." : "")}</FieldError>
                <button className="button button-full" disabled={loading || !token}>
                    {loading
                        ? <><span className="spinner"/>Verifying…</>
                        : <>Verify email<Icon name="arrow"/></>}
                </button>
            </form>}
            {message && <p className="password-recovery-message" role="status">{message}</p>}
            <p className="auth-text-switch"><Link href="/login">Return to sign in</Link></p>
        </div>
    </main>;
}
