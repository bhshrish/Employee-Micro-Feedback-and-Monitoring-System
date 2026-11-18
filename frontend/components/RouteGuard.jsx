"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/lib/subscription";
import { Skeleton } from "./UI";
export function RouteGuard({ children, requireApp = true }) {
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
