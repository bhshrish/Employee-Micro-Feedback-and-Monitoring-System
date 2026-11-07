import { createHmac, timingSafeEqual } from "node:crypto";

export function signRoleHint(payload) {
    const secret = process.env.AUTH_HINT_SECRET;
    if (!secret || secret.length < 32)
        throw new Error("AUTH_HINT_SECRET must be configured with at least 32 characters");
    return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function verifyRoleHint(value) {
    if (!value)
        return null;
    const [role, expires, signature] = value.split(".");
    if (!["admin", "manager", "employee"].includes(role) || !/^\d+$/.test(expires ?? "") || !signature)
        return null;
    if (Number(expires) <= Math.floor(Date.now() / 1000))
        return null;
    try {
        const expected = Buffer.from(signRoleHint(`${role}.${expires}`), "base64url");
        const supplied = Buffer.from(signature, "base64url");
        if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied))
            return null;
        return role;
    }
    catch {
        return null;
    }
}
