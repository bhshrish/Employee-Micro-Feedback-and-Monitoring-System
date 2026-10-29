"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useSubscription } from "@/lib/subscription";
import { formatDuration, TimerProvider, useTimer } from "@/hooks/useTimer";
import { Logo } from "./Logo";
import { Icon, type IconName } from "./Icon";
import { Modal } from "./UI";
import { RouteGuard } from "./RouteGuard";

const nav: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "My day", icon: "clock" },
  { href: "/team", label: "Team pulse", icon: "users" },
  { href: "/reports", label: "Reports", icon: "chart" },
  { href: "/billing", label: "Billing", icon: "credit" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

function IdleModal() {
  const { idleOpen, idleDuration, keepIdle, discardIdle, takeBreak } = useTimer();
  const mins = Math.max(1, Math.round(idleDuration / 60));
  return <Modal open={idleOpen} onClose={keepIdle} title="Welcome back"><div className="idle-content"><div className="idle-symbol"><Icon name="clock" size={38}/></div><h3>You were idle for {mins} min</h3><p>Choose how to treat this time. Idle time is always stored separately from active work.</p><div className="stack-actions"><button className="button" onClick={keepIdle}>Keep time</button><button className="button button-outline" onClick={discardIdle}>Discard idle time</button><button className="button button-quiet" onClick={takeBreak}>Take a break</button></div></div></Modal>;
}

function DemoControls() {
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(true);
  const { setTrialDay, expireTrial, activatePlan } = useSubscription();
  const { simulateIdle } = useTimer();
  useEffect(() => setShow(new URLSearchParams(window.location.search).get("demo") === "1"), []);
  if (!show) return null;
  return <aside className={`demo-controls ${open ? "open" : ""}`}><button className="demo-tab" onClick={() => setOpen(!open)} aria-expanded={open}>Demo controls</button>{open && <div className="demo-body"><strong>Test subscription states</strong><label>Trial day<select defaultValue="2" onChange={(e) => setTrialDay(Number(e.target.value))}>{[0,1,2,3,4,5,6,7].map((day) => <option key={day} value={day}>Day {day}</option>)}</select></label><button onClick={expireTrial}>Expire trial</button><button onClick={() => activatePlan()}>Mark paid</button><button onClick={simulateIdle}>Trigger idle modal</button></div>}</aside>;
}

function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, trialDaysLeft, signOut, selection } = useSubscription();
  const { elapsedSeconds, status: timerStatus, task } = useTimer();
  const [menu, setMenu] = useState(false);
  return <div className="app-layout">
    <aside className="app-sidebar"><Logo/><nav aria-label="Workspace">{nav.map((item) => <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}><Icon name={item.icon}/><span>{item.label}</span></Link>)}</nav><div className="sidebar-note"><Icon name="shield"/><p>Individual activity stays private. Managers see team aggregates only.</p></div></aside>
    <div className="app-column"><header className="app-header"><div className="app-header-inner"><Link href="/dashboard" className={`tracker-pill ${timerStatus === "running" ? "running" : ""}`}><span className="live-dot"/><span>{timerStatus === "running" ? formatDuration(elapsedSeconds) : timerStatus === "paused" ? "Paused" : "Start tracking"}</span><small>{task}</small></Link><div className="user-area"><span className="plan-label">{status === "active" ? selection.plan : status === "trialing" ? "Free trial" : "PULSE"}</span><button className="avatar" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Open user menu">AM</button>{menu && <div className="user-menu"><strong>Alex Morgan</strong><span>alex@demo.pulse</span><Link href="/settings" onClick={() => setMenu(false)}>Profile & settings</Link><button onClick={() => { signOut(); router.push("/"); }}><Icon name="logout" size={18}/>Sign out</button></div>}</div></div>{status === "trialing" && <div className="trial-banner"><span><strong>{trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} left</strong> in your free trial.</span><Link href="/checkout">Upgrade <Icon name="arrow" size={17}/></Link></div>}</header>
      <main className="app-main">{children}</main>
    </div>
    <nav className="mobile-app-nav" aria-label="Mobile workspace">{nav.map((item) => <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}><Icon name={item.icon} size={21}/><span>{item.label === "Team pulse" ? "Team" : item.label}</span></Link>)}</nav>
    <IdleModal/><DemoControls/>
  </div>;
}

export function AppShell({ children }: { children: ReactNode }) {
  return <TimerProvider><RouteGuard><AppFrame>{children}</AppFrame></RouteGuard></TimerProvider>;
}
