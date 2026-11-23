"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useSubscription } from "@/lib/subscription";
import { formatDuration, TimerProvider, useTimer } from "@/hooks/useTimer";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { Modal } from "./UI";
import { RouteGuard } from "./RouteGuard";
import { useToast } from "./Toast";
import type { IconName } from "./Icon";

interface NavigationItem {
    href: string;
    label: string;
    icon: IconName;
}

interface AppFrameProps {
    children: ReactNode;
}

interface AppShellProps {
    children: ReactNode;
}

const nav: NavigationItem[] = [
    { href: "/dashboard", label: "My day", icon: "clock" },
    { href: "/monitoring", label: "Burnout monitor", icon: "pulse" },
    { href: "/attendance", label: "Attendance", icon: "calendar" },
    { href: "/tools", label: "Tools", icon: "calendar" },
    { href: "/reports", label: "Reports", icon: "chart" },
    { href: "/settings", label: "Settings", icon: "settings" },
];
function IdleModal() {
    const { idleOpen, idleDuration, keepIdle, discardIdle, takeBreak } = useTimer();
    const mins = Math.max(1, Math.round(idleDuration / 60));
    return <Modal open={idleOpen} onClose={keepIdle} title="Welcome back"><div className="idle-content"><div className="idle-symbol"><Icon name="clock" size={38}/></div><h3>You were idle for {mins} min</h3><p>Choose how to treat this time. Idle time is always stored separately from active work.</p><div className="stack-actions"><button className="button" onClick={keepIdle}>Keep time</button><button className="button button-outline" onClick={discardIdle}>Discard idle time</button><button className="button button-quiet" onClick={takeBreak}>Take a break</button></div></div></Modal>;
}
function AppFrame({ children }: AppFrameProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut, user } = useSubscription();
    const { elapsedSeconds, status: timerStatus, task } = useTimer();
    const toast = useToast();
    const [menu, setMenu] = useState(false);
    const initials = user?.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "U";
    useEffect(() => {
        const handleApiError = (event: Event) => {
            const message = event instanceof CustomEvent && typeof event.detail === "string" ? event.detail : "";
            toast(message || "The activity request failed.");
        };
        window.addEventListener("calmwork:api-error", handleApiError);
        return () => window.removeEventListener("calmwork:api-error", handleApiError);
    }, [toast]);
    const visibleNav = nav.filter((item) => {
        if (item.href === "/reports")
            return user?.role === "business";
        if (item.href === "/monitoring")
            return user?.role === "business";
        return true;
    });
    return <div className="app-layout">
    <aside className="app-sidebar"><Logo /><nav aria-label="Workspace">{visibleNav.map((item) => <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}><Icon name={item.icon}/><span>{item.label}</span></Link>)}</nav><div className="sidebar-note"><Icon name="shield"/><p>Personal work tools and wellbeing check-ins are designed for privacy.</p></div></aside>
    <div className="app-column"><header className="app-header"><div className="app-header-inner"><Link href="/dashboard" className={`tracker-pill ${timerStatus === "running" ? "running" : ""}`}><span className="live-dot"/><span>{timerStatus === "running" ? formatDuration(elapsedSeconds) : timerStatus === "paused" ? "Paused" : "Start productivity session"}</span><small>{task}</small></Link><div className="user-area"><button className="avatar" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Open user menu">{initials}</button>{menu && <div className="user-menu"><strong>{user?.name}</strong><span>{user?.email}</span><Link href="/settings" onClick={() => setMenu(false)}>Profile & settings</Link><button onClick={async () => { try {
        await signOut();
        router.push("/");
    }
    catch (error) {
        toast(error instanceof Error ? error.message : "Could not sign out.");
    } }}><Icon name="logout" size={18}/>Sign out</button></div>}</div></div></header>
      <main className="app-main">{children}</main>
    </div>
    <nav className="mobile-app-nav" aria-label="Mobile workspace">{visibleNav.map((item) => <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}><Icon name={item.icon} size={21}/><span>{item.label}</span></Link>)}</nav>
    <IdleModal />
  </div>;
}
export function AppShell({ children }: AppShellProps) {
    return <TimerProvider><RouteGuard><AppFrame>{children}</AppFrame></RouteGuard></TimerProvider>;
}
