"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPassword, signupWithSession } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { Icon } from "./Icon";
import { FieldError } from "./UI";

function AuthShell({ children }) {
    return <main className="auth-split">
        <aside className="auth-hero">
            <img src="/Logo=workmark2.png" alt="CalmWork" className="auth-hero-logo"/>
            <p className="auth-hero-label">Your work. Your wellbeing.</p>
            <h2 className="auth-hero-title">A <em>calmer</em> way to know how work feels.</h2>
            <ul className="auth-hero-points">
                <li>Private personal insights</li>
                <li>Anonymous team signals</li>
                <li>No screen surveillance</li>
            </ul>
        </aside>
        <section className="auth-panel">
            <div className="auth-form">{children}</div>
            <div className="auth-privacy">
                <Icon name="shield"/>
                <p>By continuing, you agree to the <Link href="/privacy">privacy policy</Link>. Work activity is summarized without recording screens or typed text.</p>
            </div>
        </section>
    </main>;
}

export function AuthForm({ initialMode = "signin" }) {
    const [formMode, setFormMode] = useState(initialMode);
    const [accountRole, setAccountRole] = useState("employee");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [invitationCode, setInvitationCode] = useState("");
    const [organizationName, setOrganizationName] = useState("");
    const [organizationSize, setOrganizationSize] = useState("");
    const [industry, setIndustry] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { signIn, authenticated, hydrated } = useSubscription();
    const router = useRouter();
    const signingUp = formMode === "signup";

    useEffect(() => {
        if (hydrated && authenticated) router.replace("/dashboard");
    }, [hydrated, authenticated, router]);

    const switchFormMode = (mode) => {
        setFormMode(mode);
        setErrors({});
        setPassword("");
    };

    const validate = () => {
        const next = {};
        if (signingUp) {
            if (firstName.trim().length < 1) next.firstName = "Enter your first name.";
            if (lastName.trim().length < 1) next.lastName = "Enter your last name.";
            if (accountRole === "business") {
                if (organizationName.trim().length < 2) next.organizationName = "Enter your organization name.";
                if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid business email.";
                if (!organizationSize) next.organizationSize = "Select your organization size.";
                if (!industry) next.industry = "Select your industry.";
                if (password.length < 8) next.password = "Password must be at least 8 characters.";
            } else {
                if (invitationCode.trim().length < 6) next.invitationCode = "Enter your invitation code.";
                if (password.length < 8) next.password = "Password must be at least 8 characters.";
            }
        } else {
            if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address.";
            if (!password) next.password = "Enter your password.";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const submit = async (event) => {
        event.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setErrors({});
        try {
            const user = signingUp
                ? accountRole === "business"
                    ? await signupWithSession({
                        name: `${firstName.trim()} ${lastName.trim()}`,
                        email: email.trim(),
                        password,
                        accountType: "business",
                        organizationName: organizationName.trim(),
                        organizationSize,
                        industry,
                    })
                    : await signupWithSession({
                        name: `${firstName.trim()} ${lastName.trim()}`,
                        invitationCode: invitationCode.trim(),
                        password,
                    })
                : await signInWithPassword({
                    email: email.trim(),
                    password,
                    ...(accountRole === "business" ? { accountType: "business" } : {}),
                });
            signIn(user);
            router.push("/dashboard");
        } catch (error) {
            setErrors({ form: error instanceof Error ? error.message : "Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return <AuthShell>
        <img src="/Logo=green.png" alt="" className="auth-icon"/>
        <h1>{signingUp
            ? accountRole === "business" ? "Create your business account" : "Join your business"
            : accountRole === "business" ? "Business sign in" : "Welcome back!"}</h1>
        <p className="auth-intro">{signingUp
            ? accountRole === "business"
                ? "Set up your organization and start your 14-day free trial."
                : "Accept your business invitation and create your account"
            : accountRole === "business"
                ? "Sign in to manage your business workspace."
                : "Sign in with your work email and password."}</p>

        <div className="auth-role-toggle" role="group" aria-label="Account type">
            <button type="button" className={accountRole === "employee" ? "active" : ""} aria-pressed={accountRole === "employee"} onClick={() => setAccountRole("employee")}>Employee</button>
            <button type="button" className={accountRole === "business" ? "active" : ""} aria-pressed={accountRole === "business"} onClick={() => setAccountRole("business")}>Business</button>
        </div>

        <form onSubmit={submit} noValidate>
            {signingUp && accountRole === "business" ? <>
                <div className="field-row">
                    <label>First name<input value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" placeholder="eg. Alex" required/><FieldError>{errors.firstName}</FieldError></label>
                    <label>Last name<input value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" placeholder="eg. Morgan" required/><FieldError>{errors.lastName}</FieldError></label>
                </div>
                <label>Organization name<input value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} autoComplete="organization" placeholder="eg. Acme Inc." required/><FieldError>{errors.organizationName}</FieldError></label>
                <label>Business email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@company.com" required/><FieldError>{errors.email}</FieldError></label>
                <div className="field-row">
                    <label>Organization size<select value={organizationSize} onChange={(e) => setOrganizationSize(e.target.value)} required><option value="">Select size</option><option value="1-10">1–10 employees</option><option value="11-50">11–50 employees</option><option value="51-200">51–200 employees</option><option value="201-500">201–500 employees</option><option value="501+">501+ employees</option></select><FieldError>{errors.organizationSize}</FieldError></label>
                    <label>Industry<select value={industry} onChange={(e) => setIndustry(e.target.value)} required><option value="">Select industry</option><option value="Technology">Technology</option><option value="Healthcare">Healthcare</option><option value="Finance">Finance</option><option value="Education">Education</option><option value="Manufacturing">Manufacturing</option><option value="Professional services">Professional services</option><option value="Retail">Retail</option><option value="Other">Other</option></select><FieldError>{errors.industry}</FieldError></label>
                </div>
            </> : signingUp ? <>
                <div className="field-row">
                    <label>First name<input value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" placeholder="eg. John"/><FieldError>{errors.firstName}</FieldError></label>
                    <label>Last name<input value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" placeholder="eg. Doe"/><FieldError>{errors.lastName}</FieldError></label>
                </div>
                <label>Invitation code<input value={invitationCode} onChange={(e) => setInvitationCode(e.target.value)} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="xxxx1234xx56"/><FieldError>{errors.invitationCode}</FieldError></label>
            </> : <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="name@company.com"/><FieldError>{errors.email}</FieldError></label>}

            <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={signingUp ? "new-password" : "current-password"} maxLength={128} placeholder="Enter your password" required/><FieldError>{errors.password}</FieldError></label>

            {!signingUp && <p className="auth-forgot-link"><Link href="/forgot-password">Forgot password?</Link></p>}

            <FieldError>{errors.form}</FieldError>
            <button type="submit" className="button button-full auth-submit" disabled={loading}>
                {loading
                    ? <><span className="spinner"/>{signingUp ? "Creating account…" : "Signing in…"}</>
                    : signingUp ? accountRole === "business" ? "Create business account" : "Create account" : accountRole === "business" ? "Sign in to business" : "Sign in"}
            </button>
        </form>

        <p className="auth-account-switch">
            {signingUp ? "Already have an account?" : accountRole === "business" ? "New to CalmWork?" : "Have an employee invite?"}
            <button type="button" onClick={() => switchFormMode(signingUp ? "signin" : "signup")}>{signingUp ? "Sign in" : accountRole === "business" ? "Create business account" : "Join your business"}</button>
        </p>
    </AuthShell>;
}

// Reset password screen. Use it in app/forgot-password/page.tsx
export function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            setError("Enter a valid email address.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await requestPasswordReset({ email: email.trim() }); // add to lib/api
            setSent(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return <main className="reset-page">
        <img src="/Logo_workmark3.png" alt="CalmWork" className="reset-logo"/>
        <div className="reset-card">
            <Link href="/login" className="reset-back"><Icon name="back" size={18}/>Back to sign in</Link>
            <h1><span>Reset your</span><strong>Password</strong></h1>
            <p>Enter your work email and we’ll send a link to reset your password.</p>
            <form onSubmit={submit} noValidate>
                <label>Enter your email
                    <div className="reset-input">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false}/>
                        <button type="submit" disabled={loading} aria-label="Send reset link"><Icon name="arrow" size={22}/></button>
                    </div>
                </label>
                {error && <p className="reset-error" role="alert">{error}</p>}
                {sent && <p className="reset-notice" role="status">If an account matches this email, a reset link is on its way.</p>}
            </form>
        </div>
    </main>;
};