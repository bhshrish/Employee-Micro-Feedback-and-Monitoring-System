export function Icon({ name, size = 22, ...props }) {
    const paths = {
        pulse: <path d="M3 12h4l2.2-7 4.2 14 2.3-7H21"/>,
        clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
        users: <><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 20v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
        chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
        settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21h-4v-.08a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3v-4h.08a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3h4v.08a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.14.6.7 1 1.32 1H21v4h-.08c-.63 0-1.18.4-1.52 1Z"/></>,
        credit: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></>,
        arrow: <><path d="M5 12h14M14 6l6 6-6 6"/></>,
        check: <path d="m5 12 4 4L19 6"/>,
        shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
        download: <><path d="M12 3v12m-5-5 5 5 5-5M5 21h14"/></>,
        menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
        close: <path d="m6 6 12 12M18 6 6 18"/>,
        play: <path d="m8 5 11 7-11 7V5Z"/>,
        pause: <path d="M8 5v14M16 5v14"/>,
        stop: <rect x="6" y="6" width="12" height="12" rx="1"/>,
        bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
        logout: <><path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/></>,
        chevron: <path d="m8 10 4 4 4-4"/>,
        lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
        mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
        alert: <><path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 18h.01"/></>,
        spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z"/><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z"/></>,
    };
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
