const nodemailer = require("nodemailer");
const { getConfig } = require("../config/env");
const { AppError } = require("../utils/errors");
const { logger } = require("../utils/logger");

export function getTransporter(config) {
    const missingSettings = [
        ["SMTP_HOST", config.SMTP_HOST],
        ["SMTP_USER", config.SMTP_USER],
        ["SMTP_PASS", config.SMTP_PASS],
        ["SMTP_FROM", config.SMTP_FROM],
    ].filter(([, value]) => !value).map(([name]) => name);
    if (missingSettings.length > 0) {
        if (config.NODE_ENV !== "production")
            return null;
        throw new AppError(
            503,
            `Email delivery is not configured. Missing: ${missingSettings.join(", ")}.`,
            "EMAIL_DELIVERY_UNAVAILABLE",
        );
    }
    return nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT || 587,
        secure: config.SMTP_PORT === 465,
        auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
    });
}

export async function deliver({ to, subject, text }) {
    const config = getConfig();
    const transporter = getTransporter(config);
    if (!transporter) {
        logger.info("Development email preview (SMTP is not configured)");
        return;
    }
    try {
        await transporter.sendMail({
            from: { name: config.SMTP_FROM_NAME, address: config.SMTP_FROM },
            to,
            subject,
            text,
        });
    }
    catch (error) {
        logger.error({ err: error }, "SMTP email delivery failed");
        throw new AppError(502, "Email delivery failed.", "EMAIL_DELIVERY_FAILED");
    }
}

export async function sendOtpEmail({ to, code: string, expiresInMinutes }) {
    await deliver({
        to,
        subject: "Your CalmWork verification code",
        text: `Your CalmWork verification code is ${code}.\n\nIt expires in ${expiresInMinutes} minutes. If you did not request this code, you can ignore this email.\n`,
    });
}

export async function sendCalendarReminder({ to, name: string, title, startsAt, description }) {
    await deliver({
        to,
        subject: `Reminder: ${title}`,
        text: `Hello ${name},\n\nThis is a reminder for "${title}" scheduled for ${new Date(startsAt).toLocaleString()}.\n${description ? `\n${description}\n` : ""}\n— CalmWork\n`,
    });
}

export async function sendPasswordResetEmail({ to, token }) {
    const config = getConfig();
    const resetUrl = `${config.FRONTEND_URL.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
    await deliver({
        to,
        subject: "Reset your CalmWork password",
        text: `You requested a password reset for your CalmWork account.\n\nUse the link below to set a new password. It expires in ${config.PASSWORD_RESET_TTL_MINUTES} minutes:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.\n`,
    });
}

export async function sendEmailChangeVerification({ to, token }) {
    const config = getConfig();
    const verificationUrl = `${config.FRONTEND_URL.replace(/\/$/, "")}/verify-email-change?token=${encodeURIComponent(token)}`;
    await deliver({
        to,
        subject: "Verify your CalmWork email address",
        text: `You requested to change the email address on your CalmWork account.\n\nVerify this address using the link below. It expires in ${config.PASSWORD_RESET_TTL_MINUTES} minutes:\n\n${verificationUrl}\n\nIf you did not request this change, you can ignore this email.\n`,
    });
}

module.exports = { sendOtpEmail, sendCalendarReminder, sendPasswordResetEmail, sendEmailChangeVerification };
