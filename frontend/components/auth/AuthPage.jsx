"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    acceptInvitation,
    authenticate,
    requestPasswordReset,
    resetPassword,
} from "@/lib/api";
import {
    inviteValidator,
    loginValidator,
    resetPasswordValidator,
    signupValidator,
} from "@/lib/validators/auth";
import { useSubscription } from "@/lib/subscription";
import { useToast } from "@/components/Toast";
import { Logo } from "@/components/Logo";

function firstErrors(result) {
    if (result.success)
        return {};
    return Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]));
}

function Field({ label, name, type = "text", value, onChange, error, autoComplete, required = true }) {
    const id = `auth-${name}`;
    return <label htmlFor={id}>
        {label}
        <input id={id} name={name} type={type} value={value} onChange={onChange}
            autoComplete={autoComplete} required={required} aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined} />
        {error && <span className="field-error" id={`${id}-error`} role="alert">{error}</span>}
    </label>;
}

export function AuthPage({ mode = "login", token = "" }) {
    const [values, setValues] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        organizationName: "",
        termsAccepted: false,
        rememberMe: true,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const { signIn } = useSubscription();
    const router = useRouter();
    const toast = useToast();
    const update = (key) => (event) => {
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
        setValues((current) => ({ ...current, [key]: value }));
        setErrors((current) => ({ ...current, [key]: undefined }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setErrors({});
        setMessage("");
        let validation;
        if (mode === "signup")
            validation = signupValidator.safeParse(values);
        else if (mode === "invite")
            validation = inviteValidator.safeParse(values);
        else if (mode === "reset")
            validation = resetPasswordValidator.safeParse(values);
        else if (mode === "login")
            validation = loginValidator.safeParse(values);
        if (validation && !validation.success) {
            setErrors(firstErrors(validation));
            return;
        }
        setLoading(true);
        try {
            if (mode === "signup") {
                await authenticate(values.email.trim(), values.password, "signup", values.name.trim(), values.organizationName.trim(), { termsAccepted: true });
                setMessage("Your organization and 7-day trial are ready. Sign in to continue.");
                toast("Organization created.");
            }
            else if (mode === "login") {
                const user = await authenticate(values.email.trim(), values.password, "signin", undefined, undefined, { rememberMe: values.rememberMe });
                signIn(user);
                const requested = new URLSearchParams(window.location.search).get("returnTo");
                const safeReturnTo = requested?.startsWith("/") && !requested.startsWith("//")
                    ? requested
                    : null;
                const roleHome = user.subscription.status === "trial_expired"
                    ? "/billing"
                    : user.role === "admin"
                        ? "/admin"
                        : user.role === "manager"
                            ? "/dashboard/team"
                            : "/dashboard";
                const allowedReturn = safeReturnTo && (
                    safeReturnTo.startsWith("/admin") ? user.role === "admin"
                        : safeReturnTo.startsWith("/people") || safeReturnTo.startsWith("/checkout") ? user.role === "admin"
                            : safeReturnTo.startsWith("/dashboard/team") ? user.role === "manager"
                                : true
                );
                router.replace(user.subscription.status === "trial_expired" ? "/billing" : allowedReturn ? safeReturnTo : roleHome);
            }
            else if (mode === "invite") {
                await acceptInvitation({ token, email: values.email.trim(), name: values.name.trim(), password: values.password });
                setMessage("Your invitation is accepted. Sign in to open your workspace.");
                toast("Invitation accepted.");
            }
            else if (mode === "forgot") {
                const result = await requestPasswordReset(values.email.trim());
                setMessage(result.resetToken
                    ? `Reset link (development only): ${window.location.origin}/reset-password/${result.resetToken}`
                    : result.message);
            }
            else {
                await resetPassword(token, values.password);
                setMessage("Your password was changed. You can now sign in.");
                toast("Password updated.");
            }
        }
        catch (cause) {
            setErrors({ form: cause instanceof Error ? cause.message : "Something went wrong. Please try again." });
        }
        finally {
            setLoading(false);
        }
    };

    const headings = {
        login: ["Welcome back", "Sign in to your Workwell workspace."],
        signup: ["Create your organization", "Start your private 7-day trial. Your account becomes the organization Admin."],
        forgot: ["Reset your password", "Enter your work email and we’ll send reset instructions if an account exists."],
        reset: ["Choose a new password", "Use at least 8 characters, including uppercase, lowercase, and a number."],
        invite: ["Accept your invitation", "Create your account using the invite link provided by your organization."],
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
            <div className="auth-form auth-form-new">
                <p className="section-label">Workwell account</p>
                <h2>{headings[mode][0]}</h2>
                <p>{headings[mode][1]}</p>
                {message ? <div className="auth-result" role="status">
                    <p>{message}</p>
                    <Link className="button button-full" href={mode === "reset" || mode === "invite" || mode === "signup" ? "/login" : "/login"}>Continue to sign in</Link>
                </div> : <form onSubmit={submit} noValidate>
                    {(mode === "signup" || mode === "invite") && <Field label="Full name" name="name" value={values.name} onChange={update("name")} error={errors.name} autoComplete="name" />}
                    {(mode === "login" || mode === "signup" || mode === "invite" || mode === "forgot") &&
                        <Field label="Work email" name="email" type="email" value={values.email} onChange={update("email")} error={errors.email} autoComplete="email" />}
                    {mode === "signup" && <Field label="Organization name" name="organizationName" value={values.organizationName} onChange={update("organizationName")} error={errors.organizationName} autoComplete="organization" />}
                    {(mode === "login" || mode === "signup" || mode === "invite" || mode === "reset") &&
                        <Field label="Password" name="password" type="password" value={values.password} onChange={update("password")} error={errors.password} autoComplete={mode === "login" ? "current-password" : "new-password"} />}
                    {(mode === "signup" || mode === "invite" || mode === "reset") &&
                        <Field label="Confirm password" name="confirmPassword" type="password" value={values.confirmPassword} onChange={update("confirmPassword")} error={errors.confirmPassword} autoComplete="new-password" />}
                    {mode === "login" && <div className="auth-options">
                        <label className="auth-check"><input type="checkbox" checked={values.rememberMe} onChange={update("rememberMe")} /> Remember me</label>
                        <Link href="/forgot-password">Forgot password?</Link>
                    </div>}
                    {mode === "signup" && <label className="auth-check auth-terms">
                        <input type="checkbox" checked={values.termsAccepted} onChange={update("termsAccepted")} />
                        <span>I agree to the <Link href="/privacy">terms and privacy policy</Link>.</span>
                        {errors.termsAccepted && <span className="field-error" role="alert">{errors.termsAccepted}</span>}
                    </label>}
                    {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
                    <button className="button button-full" type="submit" disabled={loading}>
                        {loading ? <><span className="spinner" />Please wait…</> : ({
                            login: "Sign in",
                            signup: "Create organization",
                            forgot: "Send reset instructions",
                            reset: "Reset password",
                            invite: "Accept invitation",
                        })[mode]}
                    </button>
                </form>}
                <div className="auth-switch-links">
                    {mode !== "login" && <Link href="/login">Back to sign in</Link>}
                    {mode === "login" && <><span>New organization?</span><Link href="/signup">Start a 7-day trial</Link></>}
                    {mode === "signup" && <><span>Already have an account?</span><Link href="/login">Sign in</Link></>}
                </div>
                <div className="auth-privacy"><p>Anonymous pulse responses are reported only in groups large enough to protect privacy.</p></div>
            </div>
        </section>
    </main>;
}
