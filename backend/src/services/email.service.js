"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const env_1 = require("../config/env");
function buildResetUrl(token) {
    const config = (0, env_1.getConfig)();
    return `${config.FRONTEND_URL.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
}
function formatEmail({ to, resetUrl }) {
    const config = (0, env_1.getConfig)();
    const fromName = config.SMTP_FROM_NAME || "CalmWork";
    const from = config.SMTP_FROM || "noreply@localhost";
    return `From: ${fromName} <${from}>\r
To: ${to}\r
Subject: Reset your CalmWork password\r
Content-Type: text/plain; charset=utf-8\r
\r
You requested a password reset for your CalmWork account.

Tap the link below to set a new password. This link expires in ${config.PASSWORD_RESET_TTL_MINUTES} minutes:

${resetUrl}

If you didn't request this, you can safely ignore this email. Your password will not change.

— CalmWork
`;
}
async function sendPasswordResetEmail(input) {
    const config = (0, env_1.getConfig)();
    const resetUrl = buildResetUrl(input.token);
    const email = formatEmail({ to: input.to, resetUrl });
    const smtpConfigured = Boolean(config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS && config.SMTP_FROM);
    if (config.NODE_ENV === "production" && !smtpConfigured) {
        // In production without SMTP configured, surface the link in logs so it is not lost.
        // Wire an SMTP transporter here (e.g. nodemailer) to deliver real emails.
        console.error(`[CalmWork] SMTP not configured. Password reset link for ${input.to}:\n${resetUrl}`);
        return;
    }
    if (smtpConfigured) {
        // SMTP env vars are present but no SMTP client library is a dependency of this project.
        // Log the link for now; connect an SMTP transporter here to deliver in production.
        console.log(`[CalmWork] SMTP configured but no transporter wired. Password reset link for ${input.to}:\n${resetUrl}`);
        return;
    }
    // Development / test: log the reset link so it can be copied and opened directly.
    console.log(`[CalmWork] Password reset link for ${input.to}:\n${resetUrl}`);
    return email;
}
