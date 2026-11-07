"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/lib/subscription";
import { Skeleton } from "./UI";
export function RouteGuard({ children, requireApp = true }) {
    const { hydrated, authenticated, canUseApp } = useSubscription();
    const router = useRouter();
    useEffect(() => {
        if (!hydrated)
            return;
        if (!authenticated)
            router.replace("/login");
        else if (requireApp && !canUseApp)
            router.replace("/billing");
    }, [hydrated, authenticated, canUseApp, requireApp, router]);
    if (!hydrated || !authenticated || (requireApp && !canUseApp))
        return <main className="guard-loading"><div className="container"><Skeleton lines={5}/></div></main>;
    return children;
}
