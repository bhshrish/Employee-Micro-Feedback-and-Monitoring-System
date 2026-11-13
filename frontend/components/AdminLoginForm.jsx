"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginOperationsAdmin } from "@/lib/api";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { FieldError } from "./UI";

export function AdminLoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            await loginOperationsAdmin(email, password);
            router.push("/admin");
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
            <p>Sign in with the configured administrator email and password.</p>
            <form onSubmit={submit}>
                <label>Administrator email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" autoCapitalize="none" /></label>
                <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>
                <FieldError>{error}</FieldError>
                <button className="button button-full" disabled={loading}>{loading ? "Please wait…" : "Sign in"}<Icon name="arrow" /></button>
            </form>
            <p className="auth-forgot-link"><Link href="/forgot-password">Forgot password?</Link></p>
            <p className="auth-text-switch"><Link href="/login">Return to employee or business sign in</Link></p>
        </div>
    </main>;
}
