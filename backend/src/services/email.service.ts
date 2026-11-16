"use strict";
const nodemailer = require("nodemailer");
const { getConfig } = require("../config/env");
const { AppError } = require("../utils/errors");
const { logger } = require("../utils/logger");

function getTransporter(config) {
    if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS || !config.SMTP_FROM) {
        if (config.NODE_ENV !== "production")
            return null;
        throw new AppError(503, "Email delivery is not configured.", "EMAIL_DELIVERY_UNAVAILABLE");
    }

    // MANUAL SETUP REQUIRED: configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM using your email provider's SMTP settings.
    return nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT || 587,
        secure: config.SMTP_PORT === 465,
        auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
    });
}

async function deliver({ to, subject, text }) {
    const config = getConfig();
    const transporter = getTransporter(config);
    if (!transporter) {
        logger.info({ to, subject, text }, "Development email preview");
        return;
    }
    await transporter.sendMail({
        from: { name: config.SMTP_FROM_NAME || "CalmWork", address: config.SMTP_FROM },
        to,
        subject,
        text,
    });
}

async function sendOtpEmail({ to, code, expiresInMinutes }) {
    await deliver({
        to,
        subject: "Your CalmWork verification code",
        text: `Your CalmWork verification code is ${code}.\n\nIt expires in ${expiresInMinutes} minutes. If you did not request this code, you can ignore this email.\n`,
    });
}

async function sendCalendarReminder({ to, name, title, startsAt, description }) {
    await deliver({
        to,
        subject: `Reminder: ${title}`,
        text: `Hello ${name},\n\nThis is a reminder for "${title}" scheduled for ${new Date(startsAt).toLocaleString()}.\n${description ? `\n${description}\n` : ""}\n— CalmWork\n`,
    });
}

async function sendPasswordResetEmail({ to, token }) {
    const config = getConfig();
    const resetUrl = `${config.FRONTEND_URL.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
    await deliver({
        to,
        subject: "Reset your CalmWork password",
        text: `You requested a password reset for your CalmWork account.\n\nUse the link below to set a new password. It expires in ${config.PASSWORD_RESET_TTL_MINUTES} minutes:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.\n`,
    });
}

module.exports = { sendOtpEmail, sendCalendarReminder, sendPasswordResetEmail };
