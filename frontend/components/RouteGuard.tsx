"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/lib/subscription";
import { Skeleton } from "./UI";

interface RouteGuardProps {
    children: ReactNode;
    requireApp?: boolean;
}

export function RouteGuard({ children }: RouteGuardProps) {
    const { hydrated, authenticated } = useSubscription();
    const router = useRouter();
    useEffect(() => {
        if (!hydrated)
            return;
        if (!authenticated)
            router.replace("/login");
    }, [hydrated, authenticated, router]);
    if (!hydrated || !authenticated)
        return <main className="guard-loading"><div className="container"><Skeleton lines={5}/></div></main>;
    return children;
}
