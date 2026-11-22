"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithPassword, signupWithSession } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { FieldError } from "./UI";

type FormMode = "signin" | "signup";
type AuthFormErrors = Partial<Record<"email" | "password" | "name" | "form", string>>;

interface AuthFormProps {
    initialMode?: FormMode;
}

export function AuthForm({ initialMode = "signin" }: AuthFormProps) {
    const [formMode, setFormMode] = useState<FormMode>(initialMode);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<AuthFormErrors>({});
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

    const switchFormMode = (mode: FormMode) => {
        setFormMode(mode);
        setErrors({});
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const next: AuthFormErrors = {};
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
                });
                signIn(user);
                router.push("/dashboard");
                return;
            }

            const user = await signInWithPassword({ email: trimmedEmail, password });
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
            <Logo inverse />
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
                    ? "Create your account with your name, email, and password."
                    : "Sign in with your email and password."}</p>
                <p className="subtle-label">Use a password with at least 8 characters.</p>
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
                    <button type="button" onClick={() => switchFormMode(
                        signingUp ? "signin" : "signup"
                    )}>
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