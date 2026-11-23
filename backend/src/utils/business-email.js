"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBusinessEmail = isBusinessEmail;
const blockedConsumerDomains = new Set([
    "aol.com",
    "fastmail.com",
    "gmx.com",
    "gmx.de",
    "gmx.net",
    "hotmail.com",
    "hotmail.co.uk",
    "icloud.com",
    "live.com",
    "live.co.uk",
    "mail.com",
    "me.com",
    "msn.com",
    "outlook.com",
    "outlook.co.uk",
    "proton.me",
    "protonmail.com",
    "protonmail.ch",
    "tutanota.com",
    "yahoo.ca",
    "yahoo.co.in",
    "yahoo.co.jp",
    "yahoo.com.au",
    "yahoo.com",
    "yahoo.co.uk",
    "yandex.com",
    "zoho.com",
]);
function isBusinessEmail(email) {
    const domain = email.trim().toLowerCase().split("@").at(-1) ?? "";
    if (domain === "gmail.com" || domain === "googlemail.com")
        return true;
    return !Array.from(blockedConsumerDomains).some((blocked) => domain === blocked || domain.endsWith(`.${blocked}`));
}
