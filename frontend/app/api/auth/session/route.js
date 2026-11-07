import { NextResponse } from "next/server";
import { signRoleHint } from "@/lib/auth-hint";

const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1").replace(/\/$/, "");
const cookieName = "pulse_role";

export async function POST(request) {
    const body = await request.json().catch(() => null);
    if (typeof body?.accessToken !== "string" || body.accessToken.length < 20)
        return NextResponse.json({ message: "A valid access token is required" }, { status: 400 });
    const response = await fetch(`${apiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${body.accessToken}` },
        cache: "no-store",
    });
    if (!response.ok)
        return NextResponse.json({ message: "Authentication failed" }, { status: 401 });
    const payload = await response.json();
    const role = payload.user?.role;
    if (!["admin", "manager", "employee"].includes(role))
        return NextResponse.json({ message: "User role is invalid" }, { status: 403 });
    const expires = Math.floor(Date.now() / 1000) + 15 * 60;
    const value = `${role}.${expires}`;
    const signedValue = `${value}.${signRoleHint(value)}`;
    const result = NextResponse.json({ success: true });
    result.cookies.set(cookieName, signedValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
    });
    result.headers.set("Cache-Control", "no-store");
    return result;
}

export async function DELETE() {
    const result = new NextResponse(null, { status: 204 });
    result.cookies.set(cookieName, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
    return result;
}
