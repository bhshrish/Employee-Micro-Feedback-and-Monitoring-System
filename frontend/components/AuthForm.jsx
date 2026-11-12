"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requestOtp, verifyOtp } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { FieldError } from "./UI";

export function AuthForm() {
    const [accountType, setAccountType] = useState("employee");
    const [formMode, setFormMode] = useState("signin");
    const [name, setName] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [channel, setChannel] = useState("email");
    const [code, setCode] = useState("");
    const [inviteToken, setInviteToken] = useState("");
    const [otpRequested, setOtpRequested] = useState(false);
    const [resendIn, setResendIn] = useState(0);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { signIn, signOut, selectPlan } = useSubscription();
    const router = useRouter();
    const signingUp = accountType === "business" && formMode === "signup";
    const joining = accountType === "employee" && formMode === "join";
    const purpose = joining ? "invitation" : signingUp ? "business_signup" : "signin";

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const plan = params.get("plan");
        const cycle = params.get("cycle");
        if (plan && ["Starter", "Team", "Business"].includes(plan))
            selectPlan(plan, cycle === "yearly" ? "yearly" : "monthly");
        if (params.get("mode") === "signup") {
            setAccountType("business");
            setFormMode("signup");
        }
        if (params.has("invite")) {
            setAccountType("employee");
            setFormMode("join");
            setInviteToken(params.get("invite") || "");
            setEmail(params.get("email") || "");
        }
    }, []);

    useEffect(() => {
        if (resendIn <= 0)
            return undefined;
        const timer = window.setTimeout(() => setResendIn((value) => Math.max(0, value - 1)), 1000);
        return () => window.clearTimeout(timer);
    }, [resendIn]);

    const resetCodeState = () => {
        setOtpRequested(false);
        setCode("");
        setResendIn(0);
        setErrors({});
    };

    const chooseAccountType = (type) => {
        setAccountType(type);
        setFormMode("signin");
        setChannel("email");
        resetCodeState();
        if (type !== "employee")
            setEmail("");
    };

    const submit = async (event) => {
        event.preventDefault();
        const next = {};
        if (channel === "email" && !/^\S+@\S+\.\S+$/.test(email))
            next.email = "Enter a valid work email.";
        if (channel === "sms" && !/^\+[1-9]\d{7,14}$/.test(phone))
            next.phone = "Enter a phone number in international format, including + and country code.";
        if (!otpRequested && (signingUp || joining) && name.trim().length < 2)
            next.name = "Enter your name.";
        if (!otpRequested && signingUp && businessName.trim().length < 2)
            next.businessName = "Enter your business name.";
        if (!otpRequested && joining && inviteToken.trim().length < 32)
            next.inviteToken = "Use the invitation link provided by your business.";
        if (otpRequested && !/^\d{6}$/.test(code))
            next.code = "Enter the 6-digit code from your email.";
        setErrors(next);
        if (Object.keys(next).length)
            return;

        setLoading(true);
        try {
            if (!otpRequested) {
                await requestOtp({
                    channel,
                    ...(channel === "email" ? { email } : { phone }),
                    purpose,
                    ...(signingUp ? { name: name.trim(), organizationName: businessName.trim() } : {}),
                    ...(joining ? { invitationToken: inviteToken.trim() } : {}),
                });
                setOtpRequested(true);
                setResendIn(60);
                setErrors({ form: "If the account can sign in, a verification code has been sent." });
                return;
            }

            const user = await verifyOtp({
                channel,
                ...(channel === "email" ? { email } : { phone }),
                purpose,
                code,
                ...(joining ? { name: name.trim() } : {}),
            });
            const roleMatches = accountType === "business"
                ? user.role === "admin"
                : user.role === "employee" || user.role === "manager";
            if (!roleMatches) {
                await signOut();
                setErrors({ form: accountType === "business"
                    ? "This account belongs to an employee. Choose Employee sign in."
                    : "This account belongs to a business. Choose Business sign in." });
                return;
            }
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

    const switchFormMode = (mode) => {
        setFormMode(mode);
        setChannel("email");
        resetCodeState();
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
                <div className="tabs access-type-tabs" role="tablist" aria-label="Account type">
                    {["employee", "business"].map((type) =>
                        <button key={type} role="tab" aria-selected={accountType === type}
                            className={accountType === type ? "active" : ""}
                            onClick={() => chooseAccountType(type)}>
                            {type[0].toUpperCase() + type.slice(1)}
                        </button>)}
                </div>
                {accountType === "business" && <div className="auth-mode-switch" role="group" aria-label="Business account action">
                    <button className={formMode === "signin" ? "active" : ""} onClick={() => switchFormMode("signin")}>Sign in</button>
                    <button className={formMode === "signup" ? "active" : ""} onClick={() => switchFormMode("signup")}>Create business</button>
                </div>}
                {accountType === "employee" && <button className="auth-text-switch" type="button" onClick={() => switchFormMode(joining ? "signin" : "join")}>
                    {joining ? "Back to employee sign in" : "Have an employee invitation? Join your business"}
                </button>}
                <h2>{joining ? "Join your business." : signingUp ? "Create your business workspace." : accountType === "business" ? "Business sign in." : "Employee sign in."}</h2>
                <p>{otpRequested
                    ? `Enter the 6-digit code sent to ${channel === "email" ? email : phone}.`
                    : signingUp
                        ? "Create a business workspace with a one-time email code."
                        : joining
                            ? "Verify your email to accept the business invitation."
                            : `Sign in securely with a one-time ${channel === "email" ? "email" : "SMS"} code.`}</p>
                <p className="subtle-label">CalmWork never asks you to create or remember a password.</p>
                {!otpRequested && !signingUp && !joining && <div className="auth-mode-switch" role="group" aria-label="Verification method">
                    <button type="button" className={channel === "email" ? "active" : ""} onClick={() => { setChannel("email"); setErrors({}); }}>Email code</button>
                    <button type="button" className={channel === "sms" ? "active" : ""} onClick={() => { setChannel("sms"); setErrors({}); }}>SMS code</button>
                </div>}
                <form onSubmit={submit} noValidate>
                    {!otpRequested && (signingUp || joining) && <label>Full name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Alex Morgan"/><FieldError>{errors.name}</FieldError></label>}
                    {!otpRequested && signingUp && <label>Business name<input value={businessName} onChange={(event) => setBusinessName(event.target.value)} autoComplete="organization" maxLength={120} placeholder="Your company"/><FieldError>{errors.businessName}</FieldError></label>}
                    {!otpRequested && channel === "email" && <label>Work email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@company.com"/><FieldError>{errors.email}</FieldError></label>}
                    {!otpRequested && channel === "sms" && <label>Phone number<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" placeholder="+14155550123"/><FieldError>{errors.phone}</FieldError></label>}
                    {!otpRequested && joining && <label>Invitation code<input value={inviteToken} onChange={(event) => setInviteToken(event.target.value)} autoCapitalize="none" spellCheck={false}/><FieldError>{errors.inviteToken}</FieldError></label>}
                    {otpRequested && <label>6-digit verification code<input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000"/><FieldError>{errors.code}</FieldError></label>}
                    <FieldError>{errors.form}</FieldError>
                    <button className="button button-full" disabled={loading}>{loading
                        ? <><span className="spinner"/>{otpRequested ? "Verifying…" : "Sending code…"}</>
                        : <>{otpRequested ? "Verify and continue" : "Send me the code"}<Icon name="arrow"/></>}</button>
                    {otpRequested && <div className="auth-mode-switch">
                        <button type="button" disabled={resendIn > 0 || loading} onClick={() => { setOtpRequested(false); setCode(""); setErrors({}); }}>
                            {resendIn > 0 ? `Request another code in ${resendIn}s` : "Request another code"}
                        </button>
                        <button type="button" disabled={loading} onClick={resetCodeState}>Change address</button>
                    </div>}
                </form>
                <p className="auth-text-switch"><Link href="/admin/login">Platform administrator sign in</Link></p>
                <div className="auth-privacy"><Icon name="shield"/><p>By continuing, you agree to the <Link href="/privacy">privacy policy</Link>. Work activity is summarized without recording screens or typed text.</p></div>
            </div>
        </section>
    </main>;
}
