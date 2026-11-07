import { NextResponse } from "next/server";
import { verifyRoleHint } from "./lib/auth-hint";

const protectedPaths = [
    "/admin",
    "/dashboard",
    "/attendance",
    "/monitoring",
    "/people",
    "/reports",
    "/settings",
    "/team",
    "/billing",
    "/checkout",
];

export function proxy(request) {
    const { pathname, search } = request.nextUrl;
    if (!protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`)))
        return NextResponse.next();

    const role = verifyRoleHint(request.cookies.get("pulse_role")?.value);
    if (!role) {
        const login = new URL("/login", request.url);
        login.searchParams.set("returnTo", `${pathname}${search}`);
        return NextResponse.redirect(login);
    }

    if (pathname.startsWith("/admin") && role !== "admin")
        return NextResponse.redirect(new URL("/403", request.url));
    if (pathname.startsWith("/dashboard/team") && role !== "manager")
        return NextResponse.redirect(new URL("/403", request.url));
    if ((pathname.startsWith("/people") || pathname.startsWith("/checkout")) && role !== "admin")
        return NextResponse.redirect(new URL("/403", request.url));
    if ((pathname.startsWith("/team") || pathname.startsWith("/reports")) && !["admin", "manager"].includes(role))
        return NextResponse.redirect(new URL("/403", request.url));
    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/dashboard/:path*", "/attendance/:path*", "/monitoring/:path*", "/people/:path*", "/reports/:path*", "/settings/:path*", "/team/:path*", "/billing/:path*", "/checkout/:path*"],
};
