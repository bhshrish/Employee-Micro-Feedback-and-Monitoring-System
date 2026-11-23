"use client";
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSubscription } from "@/lib/subscription";
import { Skeleton } from "./UI";

interface RouteGuardProps {
    children: ReactNode;
    requireApp?: boolean;
}

export function RouteGuard({ children }: RouteGuardProps) {
    const { hydrated, authenticated, user } = useSubscription();
    const router = useRouter();
    const pathname = usePathname();
    const businessOnly = ["/people", "/monitoring", "/reports"].some((route) =>
        pathname === route || pathname.startsWith(`${route}/`),
    );
    const authorized = !businessOnly || user?.role === "business";
    useEffect(() => {
        if (!hydrated)
            return;
        if (!authenticated)
            router.replace("/login");
        else if (!authorized)
            router.replace("/dashboard");
    }, [hydrated, authenticated, authorized, router]);
    if (!hydrated || !authenticated || !authorized)
        return <main className="guard-loading"><div className="container"><Skeleton lines={5}/></div></main>;
    return children;
}
