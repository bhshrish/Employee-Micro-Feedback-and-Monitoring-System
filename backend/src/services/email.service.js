"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmployeeOtp = sendEmployeeOtp;
const nodemailer_1 = require("nodemailer");
const env_1 = require("../config/env");

async function sendEmployeeOtp(email, code) {
    const config = (0, env_1.getConfig)();
    if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASSWORD || !config.SMTP_FROM) {
        const { AppError } = require("../utils/errors");
        throw new AppError(503, "Email sign-in is not configured. Contact the workspace operator.", "EMAIL_UNAVAILABLE");
    }
    const transport = (0, nodemailer_1.createTransport)({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_SECURE,
        auth: { user: config.SMTP_USER, pass: config.SMTP_PASSWORD },
    });
    await transport.sendMail({
        from: config.SMTP_FROM,
        to: email,
        subject: "Your Workwell sign-in code",
        text: `Your Workwell sign-in code is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
        html: `<p>Your Workwell sign-in code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:5px">${code}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>`,
    });
}
