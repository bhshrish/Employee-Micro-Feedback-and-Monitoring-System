"use strict";
const { getConfig } = require("../config/env");
const { AppError } = require("../utils/errors");

async function sendSms({ to, message }) {
    const { SMS_API_URL, SMS_API_TOKEN } = getConfig();
    if (!SMS_API_URL || !SMS_API_TOKEN)
        throw new AppError(503, "SMS delivery is not configured.", "SMS_DELIVERY_UNAVAILABLE");

    // MANUAL SETUP REQUIRED: configure SMS_API_URL and SMS_API_TOKEN for an SMS gateway that accepts { to, message } JSON.
    const response = await fetch(SMS_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${SMS_API_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, message }),
    });
    if (!response.ok)
        throw new AppError(502, "The SMS provider could not deliver the message.", "SMS_DELIVERY_FAILED");
}

module.exports = { sendSms };
