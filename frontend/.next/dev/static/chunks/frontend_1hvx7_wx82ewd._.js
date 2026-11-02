(()=>{"use strict";(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/components/AppShell.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppShell",
    ()=>AppShell
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$subscription$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/subscription.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$hooks$2f$useTimer$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/hooks/useTimer.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Logo$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/Logo.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/Icon.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$UI$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/UI.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$RouteGuard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/RouteGuard.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/Toast.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
const nav = [
    {
        href: "/dashboard",
        label: "My day",
        icon: "clock"
    },
    {
        href: "/team",
        label: "Team pulse",
        icon: "users"
    },
    {
        href: "/reports",
        label: "Reports",
        icon: "chart"
    },
    {
        href: "/billing",
        label: "Billing",
        icon: "credit"
    },
    {
        href: "/settings",
        label: "Settings",
        icon: "settings"
    }
];
function IdleModal() {
    _s();
    const { idleOpen, idleDuration, keepIdle, discardIdle, takeBreak } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$hooks$2f$useTimer$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTimer"])();
    const mins = Math.max(1, Math.round(idleDuration / 60));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$UI$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Modal"], {
        open: idleOpen,
        onClose: keepIdle,
        title: "Welcome back",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "idle-content",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "idle-symbol",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                        name: "clock",
                        size: 38
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/AppShell.jsx",
                        lineNumber: 22,
                        columnNumber: 134
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/frontend/components/AppShell.jsx",
                    lineNumber: 22,
                    columnNumber: 105
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    children: [
                        "You were idle for ",
                        mins,
                        " min"
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/components/AppShell.jsx",
                    lineNumber: 22,
                    columnNumber: 170
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: "Choose how to treat this time. Idle time is always stored separately from active work."
                }, void 0, false, {
                    fileName: "[project]/frontend/components/AppShell.jsx",
                    lineNumber: 22,
                    columnNumber: 207
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "stack-actions",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "button",
                            onClick: keepIdle,
                            children: "Keep time"
                        }, void 0, false, {
                            fileName: "[project]/frontend/components/AppShell.jsx",
                            lineNumber: 22,
                            columnNumber: 331
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "button button-outline",
                            onClick: discardIdle,
                            children: "Discard idle time"
                        }, void 0, false, {
                            fileName: "[project]/frontend/components/AppShell.jsx",
                            lineNumber: 22,
                            columnNumber: 395
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "button button-quiet",
                            onClick: takeBreak,
                            children: "Take a break"
                        }, void 0, false, {
                            fileName: "[project]/frontend/components/AppShell.jsx",
                            lineNumber: 22,
                            columnNumber: 485
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/components/AppShell.jsx",
                    lineNumber: 22,
                    columnNumber: 300
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/AppShell.jsx",
            lineNumber: 22,
            columnNumber: 75
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/components/AppShell.jsx",
        lineNumber: 22,
        columnNumber: 12
    }, this);
}
_s(IdleModal, "qEbdljgeznZQW3Ku5AYImbPCif0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$hooks$2f$useTimer$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTimer"]
    ];
});
_c = IdleModal;
function AppFrame({ children }) {
    _s1();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { status, trialDaysLeft, signOut, selection, user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$subscription$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSubscription"])();
    const { elapsedSeconds, status: timerStatus, task } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$hooks$2f$useTimer$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTimer"])();
    const toast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const [menu, setMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const initials = user?.name.split(/\s+/).map((part)=>part[0]).slice(0, 2).join("").toUpperCase() || "U";
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppFrame.useEffect": ()=>{
            const handleApiError = {
                "AppFrame.useEffect.handleApiError": (event)=>{
                    const message = event.detail;
                    toast(message || "The activity request failed.");
                }
            }["AppFrame.useEffect.handleApiError"];
            window.addEventListener("pulse:api-error", handleApiError);
            return ({
                "AppFrame.useEffect": ()=>window.removeEventListener("pulse:api-error", handleApiError)
            })["AppFrame.useEffect"];
        }
    }["AppFrame.useEffect"], [
        toast
    ]);
    const visibleNav = nav.filter((item)=>{
        if (item.href === "/team" || item.href === "/reports") return user?.role === "admin" || user?.role === "manager";
        if (item.href === "/billing") return user?.role === "admin";
        return true;
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "app-layout",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "app-sidebar",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Logo$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Logo"], {}, void 0, false, {
                        fileName: "[project]/frontend/components/AppShell.jsx",
                        lineNumber: 48,
                        columnNumber: 36
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        "aria-label": "Workspace",
                        children: visibleNav.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: item.href,
                                className: pathname === item.href ? "active" : "",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                        name: item.icon
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/AppShell.jsx",
                                        lineNumber: 48,
                                        columnNumber: 188
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: item.label
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/AppShell.jsx",
                                        lineNumber: 48,
                                        columnNumber: 212
                                    }, this)
                                ]
                            }, item.href, true, {
                                fileName: "[project]/frontend/components/AppShell.jsx",
                                lineNumber: 48,
                                columnNumber: 98
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/AppShell.jsx",
                        lineNumber: 48,
                        columnNumber: 44
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sidebar-note",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                name: "shield"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/AppShell.jsx",
                                lineNumber: 48,
                                columnNumber: 282
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Individual activity stays private. Managers see team aggregates only."
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/AppShell.jsx",
                                lineNumber: 48,
                                columnNumber: 303
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/AppShell.jsx",
                        lineNumber: 48,
                        columnNumber: 252
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/AppShell.jsx",
                lineNumber: 48,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "app-column",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "app-header",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "app-header-inner",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/dashboard",
                                        className: `tracker-pill ${timerStatus === "running" ? "running" : ""}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "live-dot"
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/components/AppShell.jsx",
                                                lineNumber: 49,
                                                columnNumber: 195
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: timerStatus === "running" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$hooks$2f$useTimer$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDuration"])(elapsedSeconds) : timerStatus === "paused" ? "Paused" : "Start tracking"
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/components/AppShell.jsx",
                                                lineNumber: 49,
                                                columnNumber: 223
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                                children: task
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/components/AppShell.jsx",
                                                lineNumber: 49,
                                                columnNumber: 353
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/AppShell.jsx",
                                        lineNumber: 49,
                                        columnNumber: 98
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "user-area",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "plan-label",
                                                children: status === "active" ? selection.plan : status === "trialing" ? "Free trial" : "PULSE"
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/components/AppShell.jsx",
                                                lineNumber: 49,
                                                columnNumber: 408
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "avatar",
                                                onClick: ()=>setMenu(!menu),
                                                "aria-expanded": menu,
                                                "aria-label": "Open user menu",
                                                children: initials
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/components/AppShell.jsx",
                                                lineNumber: 49,
                                                columnNumber: 531
                                            }, this),
                                            menu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "user-menu",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: user?.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/components/AppShell.jsx",
                                                        lineNumber: 49,
                                                        columnNumber: 693
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: user?.email
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/components/AppShell.jsx",
                                                        lineNumber: 49,
                                                        columnNumber: 722
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: "/settings",
                                                        onClick: ()=>setMenu(false),
                                                        children: "Profile & settings"
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/components/AppShell.jsx",
                                                        lineNumber: 49,
                                                        columnNumber: 748
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: async ()=>{
                                                            try {
                                                                await signOut();
                                                                router.push("/");
                                                            } catch (error) {
                                                                toast(error instanceof Error ? error.message : "Could not sign out.");
                                                            }
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                name: "logout",
                                                                size: 18
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/components/AppShell.jsx",
                                                                lineNumber: 55,
                                                                columnNumber: 10
                                                            }, this),
                                                            "Sign out"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/components/AppShell.jsx",
                                                        lineNumber: 49,
                                                        columnNumber: 827
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/components/AppShell.jsx",
                                                lineNumber: 49,
                                                columnNumber: 666
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/AppShell.jsx",
                                        lineNumber: 49,
                                        columnNumber: 381
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/AppShell.jsx",
                                lineNumber: 49,
                                columnNumber: 64
                            }, this),
                            status === "trialing" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "trial-banner",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: [
                                                    trialDaysLeft,
                                                    " ",
                                                    trialDaysLeft === 1 ? "day" : "days",
                                                    " left"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/components/AppShell.jsx",
                                                lineNumber: 55,
                                                columnNumber: 139
                                            }, this),
                                            " in your free trial."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/AppShell.jsx",
                                        lineNumber: 55,
                                        columnNumber: 133
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/checkout",
                                        children: [
                                            "Upgrade ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                name: "arrow",
                                                size: 17
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/components/AppShell.jsx",
                                                lineNumber: 55,
                                                columnNumber: 273
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/AppShell.jsx",
                                        lineNumber: 55,
                                        columnNumber: 242
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/AppShell.jsx",
                                lineNumber: 55,
                                columnNumber: 103
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/AppShell.jsx",
                        lineNumber: 49,
                        columnNumber: 33
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "app-main",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/AppShell.jsx",
                        lineNumber: 56,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/AppShell.jsx",
                lineNumber: 49,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "mobile-app-nav",
                "aria-label": "Mobile workspace",
                children: visibleNav.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: item.href,
                        className: pathname === item.href ? "active" : "",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                name: item.icon,
                                size: 21
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/AppShell.jsx",
                                lineNumber: 58,
                                columnNumber: 183
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: item.label === "Team pulse" ? "Team" : item.label
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/AppShell.jsx",
                                lineNumber: 58,
                                columnNumber: 217
                            }, this)
                        ]
                    }, item.href, true, {
                        fileName: "[project]/frontend/components/AppShell.jsx",
                        lineNumber: 58,
                        columnNumber: 93
                    }, this))
            }, void 0, false, {
                fileName: "[project]/frontend/components/AppShell.jsx",
                lineNumber: 58,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(IdleModal, {}, void 0, false, {
                fileName: "[project]/frontend/components/AppShell.jsx",
                lineNumber: 59,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/components/AppShell.jsx",
        lineNumber: 47,
        columnNumber: 12
    }, this);
}
_s1(AppFrame, "l4Th3etxa9C2CItock82sdwSZTQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$subscription$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSubscription"],
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$hooks$2f$useTimer$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTimer"],
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"]
    ];
});
_c1 = AppFrame;
function AppShell({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$hooks$2f$useTimer$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TimerProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$RouteGuard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RouteGuard"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AppFrame, {
                children: children
            }, void 0, false, {
                fileName: "[project]/frontend/components/AppShell.jsx",
                lineNumber: 63,
                columnNumber: 39
            }, this)
        }, void 0, false, {
            fileName: "[project]/frontend/components/AppShell.jsx",
            lineNumber: 63,
            columnNumber: 27
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/components/AppShell.jsx",
        lineNumber: 63,
        columnNumber: 12
    }, this);
}
_c2 = AppShell;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "IdleModal");
__turbopack_context__.k.register(_c1, "AppFrame");
__turbopack_context__.k.register(_c2, "AppShell");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/Charts.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Heatmap",
    ()=>Heatmap,
    "Sparkline",
    ()=>Sparkline,
    "SvgBarChart",
    ()=>SvgBarChart,
    "SvgDonut",
    ()=>SvgDonut,
    "SvgLine",
    ()=>SvgLine,
    "WeeklyStacked",
    ()=>WeeklyStacked
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
function SvgBarChart({ data }) {
    const max = Math.max(60, ...data.flatMap((item)=>[
            item.active,
            item.idle
        ]));
    const plotStart = 44;
    const plotWidth = 660;
    const slotWidth = data.length ? plotWidth / data.length : plotWidth;
    const groupWidth = Math.min(32, slotWidth * .72);
    const barWidth = Math.max(1, (groupWidth - 2) / 2);
    const labelInterval = Math.max(1, Math.ceil(data.length / 8));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: "chart bar-chart",
        viewBox: "0 0 720 260",
        role: "img",
        "aria-label": "Daily active and idle activity timeline",
        children: [
            [
                0,
                1,
                2,
                3
            ].map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                    x1: "44",
                    x2: "704",
                    y1: 30 + n * 55,
                    y2: 30 + n * 55,
                    className: "grid-line"
                }, n, false, {
                    fileName: "[project]/frontend/components/Charts.jsx",
                    lineNumber: 11,
                    columnNumber: 30
                }, this)),
            data.map((item, i)=>{
                const x = plotStart + i * slotWidth + (slotWidth - groupWidth) / 2;
                const active = item.active / max * 160;
                const idle = item.idle / max * 160;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                            x: x,
                            y: 195 - active,
                            width: barWidth,
                            height: active,
                            rx: "3",
                            className: "bar-active"
                        }, void 0, false, {
                            fileName: "[project]/frontend/components/Charts.jsx",
                            lineNumber: 17,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                            x: x + barWidth + 2,
                            y: 195 - idle,
                            width: barWidth,
                            height: idle,
                            rx: "3",
                            className: "bar-idle"
                        }, void 0, false, {
                            fileName: "[project]/frontend/components/Charts.jsx",
                            lineNumber: 18,
                            columnNumber: 9
                        }, this),
                        i % labelInterval === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                            x: x + groupWidth / 2,
                            y: "225",
                            textAnchor: "middle",
                            children: item.label
                        }, void 0, false, {
                            fileName: "[project]/frontend/components/Charts.jsx",
                            lineNumber: 19,
                            columnNumber: 37
                        }, this)
                    ]
                }, item.label, true, {
                    fileName: "[project]/frontend/components/Charts.jsx",
                    lineNumber: 16,
                    columnNumber: 20
                }, this);
            })
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/components/Charts.jsx",
        lineNumber: 10,
        columnNumber: 12
    }, this);
}
_c = SvgBarChart;
function WeeklyStacked({ data }) {
    const plotStart = 35;
    const plotWidth = 550;
    const slotWidth = data.length ? plotWidth / data.length : plotWidth;
    const barWidth = Math.min(54, slotWidth * .68);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: "chart stacked-chart",
        viewBox: "0 0 620 270",
        role: "img",
        "aria-label": "Weekly productive neutral and idle time stacked bars",
        children: data.map((item, i)=>{
            const total = item.productive + item.neutral + item.idle;
            const scale = 175 / Math.max(total, 8);
            const p = item.productive * scale, n = item.neutral * scale, d = item.idle * scale;
            const x = plotStart + (i + .5) * slotWidth - barWidth / 2;
            const center = x + barWidth / 2;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: x,
                        y: 205 - p,
                        width: barWidth,
                        height: p,
                        rx: "5",
                        className: "bar-active"
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/Charts.jsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: x,
                        y: 205 - p - n,
                        width: barWidth,
                        height: n,
                        className: "bar-neutral"
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/Charts.jsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: x,
                        y: 205 - p - n - d,
                        width: barWidth,
                        height: d,
                        rx: "5",
                        className: "bar-idle"
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/Charts.jsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                        x: center,
                        y: "235",
                        textAnchor: "middle",
                        children: item.day
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/Charts.jsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                        x: center,
                        y: 190 - p - n - d,
                        textAnchor: "middle",
                        className: "chart-value",
                        children: [
                            total.toFixed(1),
                            "h"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/Charts.jsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this)
                ]
            }, item.day, true, {
                fileName: "[project]/frontend/components/Charts.jsx",
                lineNumber: 36,
                columnNumber: 20
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/frontend/components/Charts.jsx",
        lineNumber: 29,
        columnNumber: 12
    }, this);
}
_c1 = WeeklyStacked;
function SvgDonut({ productive = 82, size = 190 }) {
    const radius = 70, circumference = 2 * Math.PI * radius;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "donut-wrap",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: size,
            height: size,
            viewBox: "0 0 180 180",
            role: "img",
            "aria-label": `${productive}% productive time`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: "90",
                    cy: "90",
                    r: radius,
                    className: "donut-track"
                }, void 0, false, {
                    fileName: "[project]/frontend/components/Charts.jsx",
                    lineNumber: 48,
                    columnNumber: 151
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: "90",
                    cy: "90",
                    r: radius,
                    className: "donut-value",
                    strokeDasharray: `${circumference * productive / 100} ${circumference}`,
                    transform: "rotate(-90 90 90)"
                }, void 0, false, {
                    fileName: "[project]/frontend/components/Charts.jsx",
                    lineNumber: 48,
                    columnNumber: 211
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                    x: "90",
                    y: "84",
                    textAnchor: "middle",
                    className: "donut-number",
                    children: [
                        productive,
                        "%"
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/components/Charts.jsx",
                    lineNumber: 48,
                    columnNumber: 374
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                    x: "90",
                    y: "110",
                    textAnchor: "middle",
                    children: "productive"
                }, void 0, false, {
                    fileName: "[project]/frontend/components/Charts.jsx",
                    lineNumber: 48,
                    columnNumber: 459
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/Charts.jsx",
            lineNumber: 48,
            columnNumber: 40
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/components/Charts.jsx",
        lineNumber: 48,
        columnNumber: 12
    }, this);
}
_c2 = SvgDonut;
function SvgLine({ data, label = "Four week productivity trend" }) {
    _s();
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"])();
    const width = 700, height = 230, pad = 28;
    const points = data.map((n, i)=>`${pad + i * ((width - pad * 2) / (data.length - 1))},${height - pad - Math.max(0, Math.min(100, n)) / 100 * (height - pad * 2)}`).join(" ");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: "chart line-chart",
        viewBox: `0 0 ${width} ${height}`,
        role: "img",
        "aria-label": label,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                    id: id,
                    x1: "0",
                    y1: "0",
                    x2: "0",
                    y2: "1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                            offset: "0",
                            stopColor: "currentColor",
                            stopOpacity: ".22"
                        }, void 0, false, {
                            fileName: "[project]/frontend/components/Charts.jsx",
                            lineNumber: 54,
                            columnNumber: 169
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                            offset: "1",
                            stopColor: "currentColor",
                            stopOpacity: "0"
                        }, void 0, false, {
                            fileName: "[project]/frontend/components/Charts.jsx",
                            lineNumber: 54,
                            columnNumber: 230
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/components/Charts.jsx",
                    lineNumber: 54,
                    columnNumber: 117
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/components/Charts.jsx",
                lineNumber: 54,
                columnNumber: 111
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                points: `${pad},${height - pad} ${points} ${width - pad},${height - pad}`,
                fill: `url(#${id})`
            }, void 0, false, {
                fileName: "[project]/frontend/components/Charts.jsx",
                lineNumber: 54,
                columnNumber: 313
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                points: points,
                fill: "none",
                className: "trend-line"
            }, void 0, false, {
                fileName: "[project]/frontend/components/Charts.jsx",
                lineNumber: 54,
                columnNumber: 419
            }, this),
            data.map((n, i)=>{
                const [x, y] = points.split(" ")[i].split(",");
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: x,
                    cy: y,
                    r: "4",
                    className: "trend-dot",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("title", {
                        children: [
                            n,
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/Charts.jsx",
                        lineNumber: 54,
                        columnNumber: 616
                    }, this)
                }, i, false, {
                    fileName: "[project]/frontend/components/Charts.jsx",
                    lineNumber: 54,
                    columnNumber: 558
                }, this);
            })
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/components/Charts.jsx",
        lineNumber: 54,
        columnNumber: 12
    }, this);
}
_s(SvgLine, "WhsuKpSQZEWeFcB7gWlfDRQktoQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"]
    ];
});
_c3 = SvgLine;
function Sparkline({ data }) {
    if (!data.length) return null;
    const min = Math.min(...data) - .2, max = Math.max(...data) + .2;
    const points = data.map((n, i)=>`${i * (120 / (data.length - 1))},${44 - (n - min) / (max - min || 1) * 36}`).join(" ");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: "sparkline",
        viewBox: "0 0 120 48",
        role: "img",
        "aria-label": "Seven week morale trend",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                points: points,
                fill: "none"
            }, void 0, false, {
                fileName: "[project]/frontend/components/Charts.jsx",
                lineNumber: 61,
                columnNumber: 108
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "120",
                cy: points.split(" ").at(-1)?.split(",")[1],
                r: "3"
            }, void 0, false, {
                fileName: "[project]/frontend/components/Charts.jsx",
                lineNumber: 61,
                columnNumber: 147
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/components/Charts.jsx",
        lineNumber: 61,
        columnNumber: 12
    }, this);
}
_c4 = Sparkline;
function Heatmap({ data, teams, weeks: weekCount }) {
    const currentWeek = new Date();
    currentWeek.setUTCHours(0, 0, 0, 0);
    currentWeek.setUTCDate(currentWeek.getUTCDate() - (currentWeek.getUTCDay() + 6) % 7);
    const weeks = Array.from({
        length: weekCount
    }, (_, index)=>{
        const start = new Date(currentWeek);
        start.setUTCDate(start.getUTCDate() - (weekCount - 1 - index) * 7);
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 6);
        return {
            key: start.toISOString(),
            label: new Intl.DateTimeFormat(undefined, {
                month: "short",
                day: "numeric",
                timeZone: "UTC"
            }).format(start),
            endLabel: new Intl.DateTimeFormat(undefined, {
                month: "short",
                day: "numeric",
                timeZone: "UTC"
            }).format(end),
            current: index === weekCount - 1
        };
    });
    const cells = new Map(data.map((cell)=>[
            `${cell.teamId}:${new Date(cell.weekStart).toISOString()}`,
            cell.riskScore
        ]));
    const level = (score)=>score >= 65 ? "high" : score >= 40 ? "moderate" : "low";
    if (!teams.length) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "heatmap-empty",
            children: "No active teams are available for this workspace."
        }, void 0, false, {
            fileName: "[project]/frontend/components/Charts.jsx",
            lineNumber: 82,
            columnNumber: 16
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "heatmap-scroll",
        role: "region",
        "aria-label": `${weekCount}-week team burnout-risk heatmap`,
        tabIndex: 0,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: "heatmap-table",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("caption", {
                    className: "visually-hidden",
                    children: [
                        weekCount,
                        " weeks of aggregated burnout-risk scores for each team. Weeks below the response minimum are withheld."
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/components/Charts.jsx",
                    lineNumber: 86,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                scope: "col",
                                children: "Team"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/Charts.jsx",
                                lineNumber: 88,
                                columnNumber: 9
                            }, this),
                            weeks.map((week)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    "aria-label": `${week.label} to ${week.endLabel}${week.current ? ", current week" : ""}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: week.label
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/components/Charts.jsx",
                                            lineNumber: 90,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                            children: week.current ? "This week" : `– ${week.endLabel}`
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/components/Charts.jsx",
                                            lineNumber: 90,
                                            columnNumber: 36
                                        }, this)
                                    ]
                                }, week.key, true, {
                                    fileName: "[project]/frontend/components/Charts.jsx",
                                    lineNumber: 89,
                                    columnNumber: 30
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/Charts.jsx",
                        lineNumber: 87,
                        columnNumber: 14
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/frontend/components/Charts.jsx",
                    lineNumber: 87,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: teams.map((team)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "row",
                                    children: team.name
                                }, void 0, false, {
                                    fileName: "[project]/frontend/components/Charts.jsx",
                                    lineNumber: 94,
                                    columnNumber: 9
                                }, this),
                                weeks.map((week)=>{
                                    const score = cells.get(`${team.id}:${week.key}`);
                                    const description = score === undefined ? "No eligible data" : `${level(score)} risk, ${score}%`;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `heatmap-cell ${score === undefined ? "heat-unavailable" : `heat-${level(score)}`}`,
                                            title: `${team.name}, week of ${week.label}: ${description}`,
                                            "aria-label": description,
                                            children: score === undefined ? "—" : `${score}%`
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/components/Charts.jsx",
                                            lineNumber: 99,
                                            columnNumber: 13
                                        }, this)
                                    }, week.key, false, {
                                        fileName: "[project]/frontend/components/Charts.jsx",
                                        lineNumber: 98,
                                        columnNumber: 24
                                    }, this);
                                })
                            ]
                        }, team.id, true, {
                            fileName: "[project]/frontend/components/Charts.jsx",
                            lineNumber: 93,
                            columnNumber: 35
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/frontend/components/Charts.jsx",
                    lineNumber: 93,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/Charts.jsx",
            lineNumber: 85,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/components/Charts.jsx",
        lineNumber: 84,
        columnNumber: 12
    }, this);
}
_c5 = Heatmap;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "SvgBarChart");
__turbopack_context__.k.register(_c1, "WeeklyStacked");
__turbopack_context__.k.register(_c2, "SvgDonut");
__turbopack_context__.k.register(_c3, "SvgLine");
__turbopack_context__.k.register(_c4, "Sparkline");
__turbopack_context__.k.register(_c5, "Heatmap");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/Dashboard.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Dashboard",
    ()=>Dashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/api.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$subscription$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/subscription.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$AppShell$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/AppShell.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$TimerControl$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/TimerControl.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$PulseForm$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/PulseForm.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$UI$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/UI.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Charts$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/Charts.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
function DashboardContent() {
    _s();
    const [range, setRange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("Today");
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$subscription$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSubscription"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardContent.useEffect": ()=>{
            let active = true;
            let loading = false;
            setData(null);
            setError("");
            const sync = {
                "DashboardContent.useEffect.sync": async ()=>{
                    if (loading) return;
                    loading = true;
                    try {
                        const next = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDashboardData"])(range);
                        if (active) {
                            setData(next);
                            setError("");
                        }
                    } catch (cause) {
                        if (active) setError(cause instanceof Error ? cause.message : "Could not load your activity data.");
                    } finally{
                        loading = false;
                    }
                }
            }["DashboardContent.useEffect.sync"];
            void sync();
            const timer = window.setInterval({
                "DashboardContent.useEffect.timer": ()=>void sync()
            }["DashboardContent.useEffect.timer"], 15_000);
            return ({
                "DashboardContent.useEffect": ()=>{
                    active = false;
                    window.clearInterval(timer);
                }
            })["DashboardContent.useEffect"];
        }
    }["DashboardContent.useEffect"], [
        range
    ]);
    const today = new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric"
    }).format(new Date());
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const firstName = user?.name.trim().split(/\s+/)[0] || "there";
    const trackedSeconds = data ? Number.parseFloat(data.kpis.total) * 3600 : 0;
    const activeSeconds = data ? Number.parseFloat(data.kpis.active) * 3600 : 0;
    const activeShare = trackedSeconds ? Math.round(activeSeconds / trackedSeconds * 100) : 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "dashboard-page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "app-page-heading",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "section-label",
                                children: today
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                lineNumber: 55,
                                columnNumber: 12
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                children: [
                                    greeting,
                                    ", ",
                                    firstName,
                                    "."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                lineNumber: 55,
                                columnNumber: 52
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "A clear view of your time and energy—just for you."
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                lineNumber: 55,
                                columnNumber: 85
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/Dashboard.jsx",
                        lineNumber: 55,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "range-switcher",
                        role: "group",
                        "aria-label": "Dashboard date range",
                        children: [
                            "Today",
                            "7d",
                            "30d"
                        ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: range === item ? "active" : "",
                                onClick: ()=>setRange(item),
                                "aria-pressed": range === item,
                                children: item
                            }, item, false, {
                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                lineNumber: 56,
                                columnNumber: 124
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/Dashboard.jsx",
                        lineNumber: 56,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/Dashboard.jsx",
                lineNumber: 54,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$TimerControl$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TimerControl"], {}, void 0, false, {
                fileName: "[project]/frontend/components/Dashboard.jsx",
                lineNumber: 58,
                columnNumber: 5
            }, this),
            !data && !error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "loading-grid",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$UI$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Skeleton"], {
                        lines: 4
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/Dashboard.jsx",
                        lineNumber: 59,
                        columnNumber: 54
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$UI$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Skeleton"], {
                        lines: 4
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/Dashboard.jsx",
                        lineNumber: 59,
                        columnNumber: 75
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$UI$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Skeleton"], {
                        lines: 4
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/Dashboard.jsx",
                        lineNumber: 59,
                        columnNumber: 96
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/Dashboard.jsx",
                lineNumber: 59,
                columnNumber: 24
            }, this) : null,
            error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$UI$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EmptyState"], {
                title: "Activity data unavailable",
                text: error
            }, void 0, false, {
                fileName: "[project]/frontend/components/Dashboard.jsx",
                lineNumber: 60,
                columnNumber: 14
            }, this) : null,
            data ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "kpi-grid",
                        "aria-label": "Activity key performance indicators",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$UI$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                                label: `Total tracked (${range})`,
                                value: data.kpis.total,
                                note: `Across ${data.sessions} recorded sessions`,
                                icon: "clock"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                lineNumber: 63,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$UI$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                                label: "Active time",
                                value: data.kpis.active,
                                note: `${activeShare}% of tracked time`,
                                icon: "pulse"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                lineNumber: 64,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$UI$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                                label: "Idle time",
                                value: data.kpis.idle,
                                note: "Stored separately",
                                icon: "clock"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                lineNumber: 65,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$UI$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                                label: "Productive",
                                value: `${data.kpis.productive}%`,
                                note: "Of active tracked time",
                                icon: "spark"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                lineNumber: 66,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$UI$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                                label: "Last 7 days",
                                value: data.kpis.weekly,
                                note: "Recorded activity",
                                icon: "chart"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                lineNumber: 67,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$UI$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                                label: "Current streak",
                                value: `${data.kpis.streak} days`,
                                note: "Consecutive days with recorded activity",
                                icon: "users"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                lineNumber: 68,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/Dashboard.jsx",
                        lineNumber: 62,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "dashboard-grid",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "data-card span-2 daily-activity",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-heading",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "section-label",
                                                        children: range === "Today" ? "Today" : range === "7d" ? "Last 7 days" : "Last 30 days"
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                                        lineNumber: 71,
                                                        columnNumber: 97
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        children: "Activity timeline"
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                                        lineNumber: 71,
                                                        columnNumber: 209
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                                lineNumber: 71,
                                                columnNumber: 92
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "chart-legend",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                                className: "legend-active"
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                                                lineNumber: 71,
                                                                columnNumber: 277
                                                            }, this),
                                                            "Active"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                                        lineNumber: 71,
                                                        columnNumber: 271
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                                className: "legend-idle"
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                                                lineNumber: 71,
                                                                columnNumber: 326
                                                            }, this),
                                                            "Idle"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                                        lineNumber: 71,
                                                        columnNumber: 320
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                                lineNumber: 71,
                                                columnNumber: 241
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                        lineNumber: 71,
                                        columnNumber: 62
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Charts$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SvgBarChart"], {
                                        data: data.daily
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                        lineNumber: 71,
                                        columnNumber: 377
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                lineNumber: 71,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$PulseForm$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PulseForm"], {}, void 0, false, {
                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                lineNumber: 72,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "data-card span-2 weekly-activity",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-heading",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "section-label",
                                                        children: "Last 7 days"
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                                        lineNumber: 73,
                                                        columnNumber: 98
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        children: "Where your time went"
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                                        lineNumber: 73,
                                                        columnNumber: 142
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                                lineNumber: 73,
                                                columnNumber: 93
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "chart-legend",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                                className: "legend-active"
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                                                lineNumber: 73,
                                                                columnNumber: 213
                                                            }, this),
                                                            "Productive"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                                        lineNumber: 73,
                                                        columnNumber: 207
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                                className: "legend-neutral"
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                                                lineNumber: 73,
                                                                columnNumber: 266
                                                            }, this),
                                                            "Neutral"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                                        lineNumber: 73,
                                                        columnNumber: 260
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                                className: "legend-idle"
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                                                lineNumber: 73,
                                                                columnNumber: 317
                                                            }, this),
                                                            "Idle"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                                        lineNumber: 73,
                                                        columnNumber: 311
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                                lineNumber: 73,
                                                columnNumber: 177
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                        lineNumber: 73,
                                        columnNumber: 63
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Charts$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WeeklyStacked"], {
                                        data: data.weekly
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                        lineNumber: 73,
                                        columnNumber: 368
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                lineNumber: 73,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "data-card donut-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-heading",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "section-label",
                                                    children: "Focus"
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/components/Dashboard.jsx",
                                                    lineNumber: 74,
                                                    columnNumber: 86
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    children: "Productive vs. other"
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/components/Dashboard.jsx",
                                                    lineNumber: 74,
                                                    columnNumber: 124
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/components/Dashboard.jsx",
                                            lineNumber: 74,
                                            columnNumber: 81
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                        lineNumber: 74,
                                        columnNumber: 51
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Charts$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SvgDonut"], {
                                        productive: data.kpis.productive
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                        lineNumber: 74,
                                        columnNumber: 165
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "donut-details",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Productive work"
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                                        lineNumber: 74,
                                                        columnNumber: 244
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: [
                                                            data.productiveHours.toFixed(1),
                                                            "h"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                                        lineNumber: 74,
                                                        columnNumber: 272
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                                lineNumber: 74,
                                                columnNumber: 241
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Other active time"
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                                        lineNumber: 74,
                                                        columnNumber: 330
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: [
                                                            data.neutralHours.toFixed(1),
                                                            "h"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                                        lineNumber: 74,
                                                        columnNumber: 360
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                                lineNumber: 74,
                                                columnNumber: 327
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Idle"
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                                        lineNumber: 74,
                                                        columnNumber: 415
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: data.kpis.idle
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                                        lineNumber: 74,
                                                        columnNumber: 432
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                                lineNumber: 74,
                                                columnNumber: 412
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                        lineNumber: 74,
                                        columnNumber: 210
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                lineNumber: 74,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "data-card span-3 trend-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-heading",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "section-label",
                                                    children: "Recent activity"
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/components/Dashboard.jsx",
                                                    lineNumber: 75,
                                                    columnNumber: 93
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    children: "Your productive rhythm"
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/components/Dashboard.jsx",
                                                    lineNumber: 75,
                                                    columnNumber: 141
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/components/Dashboard.jsx",
                                            lineNumber: 75,
                                            columnNumber: 88
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                        lineNumber: 75,
                                        columnNumber: 58
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Charts$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SvgLine"], {
                                        data: data.trend,
                                        label: "Recent daily productivity percentages"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/Dashboard.jsx",
                                        lineNumber: 75,
                                        columnNumber: 184
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/Dashboard.jsx",
                                lineNumber: 75,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/Dashboard.jsx",
                        lineNumber: 70,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/Dashboard.jsx",
                lineNumber: 61,
                columnNumber: 13
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/components/Dashboard.jsx",
        lineNumber: 53,
        columnNumber: 12
    }, this);
}
_s(DashboardContent, "67dEgfFDzzuv7XUY0epNk97JU7Q=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$subscription$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSubscription"]
    ];
});
_c = DashboardContent;
function Dashboard() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$AppShell$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppShell"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DashboardContent, {}, void 0, false, {
            fileName: "[project]/frontend/components/Dashboard.jsx",
            lineNumber: 80,
            columnNumber: 48
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/components/Dashboard.jsx",
        lineNumber: 80,
        columnNumber: 38
    }, this);
}
_c1 = Dashboard;
var _c, _c1;
__turbopack_context__.k.register(_c, "DashboardContent");
__turbopack_context__.k.register(_c1, "Dashboard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/Logo.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Logo",
    ()=>Logo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
;
function Logo({ inverse = false }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: "/",
        className: `logo ${inverse ? "logo-inverse" : ""}`,
        "aria-label": "PULSE home",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "logo-mark",
                "aria-hidden": "true",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                        fileName: "[project]/frontend/components/Logo.jsx",
                        lineNumber: 3,
                        columnNumber: 150
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                        fileName: "[project]/frontend/components/Logo.jsx",
                        lineNumber: 3,
                        columnNumber: 155
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                        fileName: "[project]/frontend/components/Logo.jsx",
                        lineNumber: 3,
                        columnNumber: 160
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                        fileName: "[project]/frontend/components/Logo.jsx",
                        lineNumber: 3,
                        columnNumber: 165
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/Logo.jsx",
                lineNumber: 3,
                columnNumber: 103
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: "PULSE"
            }, void 0, false, {
                fileName: "[project]/frontend/components/Logo.jsx",
                lineNumber: 3,
                columnNumber: 177
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/components/Logo.jsx",
        lineNumber: 3,
        columnNumber: 12
    }, this);
}
_c = Logo;
var _c;
__turbopack_context__.k.register(_c, "Logo");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/PulseForm.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PulseForm",
    ()=>PulseForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/api.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/Icon.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/Toast.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function PulseForm() {
    _s();
    const [mood, setMood] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(4);
    const [stress, setStress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(2);
    const [workload, setWorkload] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(3);
    const [submitted, setSubmitted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const toast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PulseForm.useEffect": ()=>{
            let active = true;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPulseStatus"])().then({
                "PulseForm.useEffect": (value)=>{
                    if (active) setSubmitted(value);
                }
            }["PulseForm.useEffect"]).catch({
                "PulseForm.useEffect": (error)=>toast(error instanceof Error ? error.message : "Could not load pulse status.")
            }["PulseForm.useEffect"]).finally({
                "PulseForm.useEffect": ()=>{
                    if (active) setLoading(false);
                }
            }["PulseForm.useEffect"]);
            return ({
                "PulseForm.useEffect": ()=>{
                    active = false;
                }
            })["PulseForm.useEffect"];
        }
    }["PulseForm.useEffect"], [
        toast
    ]);
    const submit = async (e)=>{
        e.preventDefault();
        setLoading(true);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["submitPulse"])({
                mood,
                stress,
                workload
            });
            setSubmitted(true);
            toast("Your anonymous pulse was submitted.");
        } catch (error) {
            toast(error instanceof Error ? error.message : "Could not submit your pulse.");
        } finally{
            setLoading(false);
        }
    };
    if (submitted) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "pulse-card submitted",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "success-mark",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                    name: "check",
                    size: 34
                }, void 0, false, {
                    fileName: "[project]/frontend/components/PulseForm.jsx",
                    lineNumber: 38,
                    columnNumber: 88
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/components/PulseForm.jsx",
                lineNumber: 38,
                columnNumber: 58
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "section-label",
                children: "Weekly pulse"
            }, void 0, false, {
                fileName: "[project]/frontend/components/PulseForm.jsx",
                lineNumber: 38,
                columnNumber: 124
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: "Submitted this week."
            }, void 0, false, {
                fileName: "[project]/frontend/components/PulseForm.jsx",
                lineNumber: 38,
                columnNumber: 169
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: "Thank you for checking in. Your response is combined anonymously with your team’s."
            }, void 0, false, {
                fileName: "[project]/frontend/components/PulseForm.jsx",
                lineNumber: 38,
                columnNumber: 198
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/components/PulseForm.jsx",
        lineNumber: 38,
        columnNumber: 16
    }, this);
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "pulse-card",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "section-label",
                children: "Weekly pulse"
            }, void 0, false, {
                fileName: "[project]/frontend/components/PulseForm.jsx",
                lineNumber: 40,
                columnNumber: 48
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: "Checking your pulse status…"
            }, void 0, false, {
                fileName: "[project]/frontend/components/PulseForm.jsx",
                lineNumber: 40,
                columnNumber: 93
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/components/PulseForm.jsx",
        lineNumber: 40,
        columnNumber: 16
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "pulse-card",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card-heading",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "section-label",
                                children: "Weekly pulse"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/PulseForm.jsx",
                                lineNumber: 41,
                                columnNumber: 79
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: "How is work feeling?"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/PulseForm.jsx",
                                lineNumber: 41,
                                columnNumber: 124
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/PulseForm.jsx",
                        lineNumber: 41,
                        columnNumber: 74
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "anonymous-chip",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                name: "shield",
                                size: 17
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/PulseForm.jsx",
                                lineNumber: 41,
                                columnNumber: 192
                            }, this),
                            "Anonymous"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/PulseForm.jsx",
                        lineNumber: 41,
                        columnNumber: 159
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/PulseForm.jsx",
                lineNumber: 41,
                columnNumber: 44
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: submit,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("fieldset", {
                        className: "mood-field",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("legend", {
                                children: "Your overall mood"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/PulseForm.jsx",
                                lineNumber: 41,
                                columnNumber: 302
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mood-buttons",
                                children: [
                                    1,
                                    2,
                                    3,
                                    4,
                                    5
                                ].map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: mood === n ? "active" : "",
                                        onClick: ()=>setMood(n),
                                        "aria-pressed": mood === n,
                                        "aria-label": `Mood ${n} out of 5`,
                                        children: n
                                    }, n, false, {
                                        fileName: "[project]/frontend/components/PulseForm.jsx",
                                        lineNumber: 41,
                                        columnNumber: 394
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/PulseForm.jsx",
                                lineNumber: 41,
                                columnNumber: 336
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "range-labels",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Low"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/PulseForm.jsx",
                                        lineNumber: 41,
                                        columnNumber: 600
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Great"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/PulseForm.jsx",
                                        lineNumber: 41,
                                        columnNumber: 616
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/PulseForm.jsx",
                                lineNumber: 41,
                                columnNumber: 570
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/PulseForm.jsx",
                        lineNumber: 41,
                        columnNumber: 269
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "slider-label",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "Stress ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: [
                                            stress,
                                            "/5"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/PulseForm.jsx",
                                        lineNumber: 41,
                                        columnNumber: 696
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/PulseForm.jsx",
                                lineNumber: 41,
                                columnNumber: 683
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "range",
                                min: "1",
                                max: "5",
                                value: stress,
                                onChange: (e)=>setStress(Number(e.target.value))
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/PulseForm.jsx",
                                lineNumber: 41,
                                columnNumber: 730
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "range-labels",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                        children: "Calm"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/PulseForm.jsx",
                                        lineNumber: 41,
                                        columnNumber: 865
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                        children: "Overwhelmed"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/PulseForm.jsx",
                                        lineNumber: 41,
                                        columnNumber: 884
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/PulseForm.jsx",
                                lineNumber: 41,
                                columnNumber: 834
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/PulseForm.jsx",
                        lineNumber: 41,
                        columnNumber: 651
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "slider-label",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "Workload ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: [
                                            workload,
                                            "/5"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/PulseForm.jsx",
                                        lineNumber: 41,
                                        columnNumber: 972
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/PulseForm.jsx",
                                lineNumber: 41,
                                columnNumber: 957
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "range",
                                min: "1",
                                max: "5",
                                value: workload,
                                onChange: (e)=>setWorkload(Number(e.target.value))
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/PulseForm.jsx",
                                lineNumber: 41,
                                columnNumber: 1008
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "range-labels",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                        children: "Light"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/PulseForm.jsx",
                                        lineNumber: 41,
                                        columnNumber: 1147
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                        children: "Unsustainable"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/PulseForm.jsx",
                                        lineNumber: 41,
                                        columnNumber: 1167
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/PulseForm.jsx",
                                lineNumber: 41,
                                columnNumber: 1116
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/PulseForm.jsx",
                        lineNumber: 41,
                        columnNumber: 925
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "form-note",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                name: "shield",
                                size: 17
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/PulseForm.jsx",
                                lineNumber: 41,
                                columnNumber: 1235
                            }, this),
                            "Only ratings are saved; no personal comments are collected. Managers see groups of at least five responses."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/PulseForm.jsx",
                        lineNumber: 41,
                        columnNumber: 1210
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "button button-full",
                        disabled: loading,
                        children: loading ? "Submitting…" : "Submit anonymous pulse"
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/PulseForm.jsx",
                        lineNumber: 41,
                        columnNumber: 1377
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/PulseForm.jsx",
                lineNumber: 41,
                columnNumber: 245
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/components/PulseForm.jsx",
        lineNumber: 41,
        columnNumber: 12
    }, this);
}
_s(PulseForm, "G4kx3MzTtZiTxwQvriK6lIEeY/s=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Toast$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"]
    ];
});
_c = PulseForm;
var _c;
__turbopack_context__.k.register(_c, "PulseForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/RouteGuard.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RouteGuard",
    ()=>RouteGuard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$subscription$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/subscription.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$UI$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/UI.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function RouteGuard({ children, requireApp = true }) {
    _s();
    const { hydrated, authenticated, canUseApp } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$subscription$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSubscription"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RouteGuard.useEffect": ()=>{
            if (!hydrated) return;
            if (!authenticated) router.replace("/login");
            else if (requireApp && !canUseApp) router.replace("/trial-expired");
        }
    }["RouteGuard.useEffect"], [
        hydrated,
        authenticated,
        canUseApp,
        requireApp,
        router
    ]);
    if (!hydrated || !authenticated || requireApp && !canUseApp) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "guard-loading",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "container",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$UI$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Skeleton"], {
                lines: 5
            }, void 0, false, {
                fileName: "[project]/frontend/components/RouteGuard.jsx",
                lineNumber: 18,
                columnNumber: 75
            }, this)
        }, void 0, false, {
            fileName: "[project]/frontend/components/RouteGuard.jsx",
            lineNumber: 18,
            columnNumber: 48
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/components/RouteGuard.jsx",
        lineNumber: 18,
        columnNumber: 16
    }, this);
    return children;
}
_s(RouteGuard, "Pf6XSxgPXdy5a0vkCo7YYnmfDOg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$subscription$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSubscription"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = RouteGuard;
var _c;
__turbopack_context__.k.register(_c, "RouteGuard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/TimerControl.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TimerControl",
    ()=>TimerControl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$hooks$2f$useTimer$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/hooks/useTimer.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/Icon.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function TimerControl() {
    _s();
    const { status, elapsedSeconds, lastSession, task, category, start, pause, stop, setTask, setCategory } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$hooks$2f$useTimer$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTimer"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "timer-card",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "timer-main",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "timer-status",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `live-dot ${status === "running" ? "" : "inactive"}`
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/TimerControl.jsx",
                                lineNumber: 6,
                                columnNumber: 102
                            }, this),
                            status === "running" ? "Tracking now" : status === "paused" ? "Session paused" : "Ready when you are"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/TimerControl.jsx",
                        lineNumber: 6,
                        columnNumber: 72
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "timer-display",
                        "aria-live": "off",
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$hooks$2f$useTimer$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDuration"])(elapsedSeconds)
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/TimerControl.jsx",
                        lineNumber: 6,
                        columnNumber: 283
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: status === "stopped" && lastSession ? `Last session · ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$hooks$2f$useTimer$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDuration"])(lastSession)}` : "Activity sessions are saved to your workspace."
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/TimerControl.jsx",
                        lineNumber: 6,
                        columnNumber: 368
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/TimerControl.jsx",
                lineNumber: 6,
                columnNumber: 44
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "timer-settings",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        children: [
                            "Project / task",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: task,
                                disabled: status !== "stopped",
                                onChange: (e)=>setTask(e.target.value),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Product strategy"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/TimerControl.jsx",
                                        lineNumber: 6,
                                        columnNumber: 667
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Design review"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/TimerControl.jsx",
                                        lineNumber: 6,
                                        columnNumber: 700
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Development"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/TimerControl.jsx",
                                        lineNumber: 6,
                                        columnNumber: 730
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Customer research"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/TimerControl.jsx",
                                        lineNumber: 6,
                                        columnNumber: 758
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        children: "Admin & email"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/TimerControl.jsx",
                                        lineNumber: 6,
                                        columnNumber: 792
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/TimerControl.jsx",
                                lineNumber: 6,
                                columnNumber: 572
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/TimerControl.jsx",
                        lineNumber: 6,
                        columnNumber: 551
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("fieldset", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("legend", {
                                children: "Tag this work block"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/TimerControl.jsx",
                                lineNumber: 6,
                                columnNumber: 849
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "segmented",
                                children: [
                                    "Productive",
                                    "Neutral",
                                    "Distracting"
                                ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: category === item ? "active" : "",
                                        onClick: ()=>setCategory(item),
                                        "aria-pressed": category === item,
                                        children: item
                                    }, item, false, {
                                        fileName: "[project]/frontend/components/TimerControl.jsx",
                                        lineNumber: 6,
                                        columnNumber: 968
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/TimerControl.jsx",
                                lineNumber: 6,
                                columnNumber: 885
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/TimerControl.jsx",
                        lineNumber: 6,
                        columnNumber: 839
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "timer-actions",
                        children: [
                            status !== "running" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "button",
                                onClick: start,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                        name: "play"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/TimerControl.jsx",
                                        lineNumber: 6,
                                        columnNumber: 1246
                                    }, this),
                                    "Start"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/TimerControl.jsx",
                                lineNumber: 6,
                                columnNumber: 1203
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "button button-dark",
                                onClick: pause,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                        name: "pause"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/TimerControl.jsx",
                                        lineNumber: 6,
                                        columnNumber: 1337
                                    }, this),
                                    "Pause"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/TimerControl.jsx",
                                lineNumber: 6,
                                columnNumber: 1282
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "button button-outline",
                                onClick: stop,
                                disabled: status === "stopped" && elapsedSeconds === 0,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                        name: "stop"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/TimerControl.jsx",
                                        lineNumber: 6,
                                        columnNumber: 1485
                                    }, this),
                                    "Stop"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/TimerControl.jsx",
                                lineNumber: 6,
                                columnNumber: 1372
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/TimerControl.jsx",
                        lineNumber: 6,
                        columnNumber: 1148
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/TimerControl.jsx",
                lineNumber: 6,
                columnNumber: 519
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/components/TimerControl.jsx",
        lineNumber: 6,
        columnNumber: 12
    }, this);
}
_s(TimerControl, "44ilF0zyKvKPGUedvljYBs/mMcI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$hooks$2f$useTimer$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTimer"]
    ];
});
_c = TimerControl;
var _c;
__turbopack_context__.k.register(_c, "TimerControl");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/UI.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DataTable",
    ()=>DataTable,
    "EmptyState",
    ()=>EmptyState,
    "FieldError",
    ()=>FieldError,
    "KpiCard",
    ()=>KpiCard,
    "Modal",
    ()=>Modal,
    "Skeleton",
    ()=>Skeleton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/Icon.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function Modal({ open, onClose, title, children, wide = false }) {
    _s();
    const closeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Modal.useEffect": ()=>{
            if (!open) return;
            const previous = document.activeElement;
            const key = {
                "Modal.useEffect.key": (event)=>{
                    if (event.key === "Escape") onClose();
                }
            }["Modal.useEffect.key"];
            document.addEventListener("keydown", key);
            document.body.style.overflow = "hidden";
            window.setTimeout({
                "Modal.useEffect": ()=>closeRef.current?.focus()
            }["Modal.useEffect"], 0);
            return ({
                "Modal.useEffect": ()=>{
                    document.removeEventListener("keydown", key);
                    document.body.style.overflow = "";
                    previous?.focus();
                }
            })["Modal.useEffect"];
        }
    }["Modal.useEffect"], [
        open,
        onClose
    ]);
    if (!open) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "modal-backdrop",
        onMouseDown: (e)=>{
            if (e.target === e.currentTarget) onClose();
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: `modal ${wide ? "modal-wide" : ""}`,
            role: "dialog",
            "aria-modal": "true",
            "aria-labelledby": "modal-title",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "modal-head",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            id: "modal-title",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/frontend/components/UI.jsx",
                            lineNumber: 20,
                            columnNumber: 170
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            ref: closeRef,
                            className: "icon-button",
                            onClick: onClose,
                            "aria-label": "Close dialog",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                name: "close"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/UI.jsx",
                                lineNumber: 20,
                                columnNumber: 294
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/frontend/components/UI.jsx",
                            lineNumber: 20,
                            columnNumber: 203
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/components/UI.jsx",
                    lineNumber: 20,
                    columnNumber: 142
                }, this),
                children
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/UI.jsx",
            lineNumber: 20,
            columnNumber: 23
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/components/UI.jsx",
        lineNumber: 19,
        columnNumber: 12
    }, this);
}
_s(Modal, "GT2K607LEp8jm6Vo4w60mdjRd68=");
_c = Modal;
function KpiCard({ label, value, note, icon = "chart" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: "kpi-card",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "kpi-label",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                        name: icon,
                        size: 20
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/UI.jsx",
                        lineNumber: 23,
                        columnNumber: 69
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/UI.jsx",
                        lineNumber: 23,
                        columnNumber: 98
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/UI.jsx",
                lineNumber: 23,
                columnNumber: 42
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                children: value
            }, void 0, false, {
                fileName: "[project]/frontend/components/UI.jsx",
                lineNumber: 23,
                columnNumber: 124
            }, this),
            note && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: note
            }, void 0, false, {
                fileName: "[project]/frontend/components/UI.jsx",
                lineNumber: 23,
                columnNumber: 157
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/components/UI.jsx",
        lineNumber: 23,
        columnNumber: 12
    }, this);
}
_c1 = KpiCard;
function Skeleton({ lines = 3 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "skeleton",
        "aria-label": "Loading content",
        "aria-busy": "true",
        children: Array.from({
            length: lines
        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    width: `${92 - i * 11}%`
                }
            }, i, false, {
                fileName: "[project]/frontend/components/UI.jsx",
                lineNumber: 26,
                columnNumber: 129
            }, this))
    }, void 0, false, {
        fileName: "[project]/frontend/components/UI.jsx",
        lineNumber: 26,
        columnNumber: 12
    }, this);
}
_c2 = Skeleton;
function EmptyState({ title, text }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "empty-state",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$Icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                name: "check",
                size: 30
            }, void 0, false, {
                fileName: "[project]/frontend/components/UI.jsx",
                lineNumber: 29,
                columnNumber: 41
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                children: title
            }, void 0, false, {
                fileName: "[project]/frontend/components/UI.jsx",
                lineNumber: 29,
                columnNumber: 71
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: text
            }, void 0, false, {
                fileName: "[project]/frontend/components/UI.jsx",
                lineNumber: 29,
                columnNumber: 87
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/components/UI.jsx",
        lineNumber: 29,
        columnNumber: 12
    }, this);
}
_c3 = EmptyState;
function DataTable({ headers, rows }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "table-scroll",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: "data-table",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: headers.map((header)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                children: header
                            }, header, false, {
                                fileName: "[project]/frontend/components/UI.jsx",
                                lineNumber: 32,
                                columnNumber: 108
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/UI.jsx",
                        lineNumber: 32,
                        columnNumber: 79
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/frontend/components/UI.jsx",
                    lineNumber: 32,
                    columnNumber: 72
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: rows.map((row, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            children: row.map((cell, j)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    children: cell
                                }, j, false, {
                                    fileName: "[project]/frontend/components/UI.jsx",
                                    lineNumber: 32,
                                    columnNumber: 216
                                }, this))
                        }, i, false, {
                            fileName: "[project]/frontend/components/UI.jsx",
                            lineNumber: 32,
                            columnNumber: 182
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/frontend/components/UI.jsx",
                    lineNumber: 32,
                    columnNumber: 153
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/UI.jsx",
            lineNumber: 32,
            columnNumber: 42
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/components/UI.jsx",
        lineNumber: 32,
        columnNumber: 12
    }, this);
}
_c4 = DataTable;
function FieldError({ children }) {
    return children ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "field-error",
        role: "alert",
        children: children
    }, void 0, false, {
        fileName: "[project]/frontend/components/UI.jsx",
        lineNumber: 35,
        columnNumber: 23
    }, this) : null;
}
_c5 = FieldError;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "Modal");
__turbopack_context__.k.register(_c1, "KpiCard");
__turbopack_context__.k.register(_c2, "Skeleton");
__turbopack_context__.k.register(_c3, "EmptyState");
__turbopack_context__.k.register(_c4, "DataTable");
__turbopack_context__.k.register(_c5, "FieldError");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/hooks/useIdleDetector.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useIdleDetector",
    ()=>useIdleDetector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function useIdleDetector(thresholdMinutes, enabled, onIdle) {
    _s();
    const lastActivity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(Date.now());
    const callback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onIdle);
    callback.current = onIdle;
    const resetActivity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useIdleDetector.useCallback[resetActivity]": ()=>{
            lastActivity.current = Date.now();
        }
    }["useIdleDetector.useCallback[resetActivity]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useIdleDetector.useEffect": ()=>{
            const events = [
                "mousemove",
                "mousedown",
                "keydown",
                "scroll",
                "touchstart"
            ];
            events.forEach({
                "useIdleDetector.useEffect": (event)=>window.addEventListener(event, resetActivity, {
                        passive: true
                    })
            }["useIdleDetector.useEffect"]);
            const interval = window.setInterval({
                "useIdleDetector.useEffect.interval": ()=>{
                    const idleSeconds = (Date.now() - lastActivity.current) / 1000;
                    if (enabled && idleSeconds >= thresholdMinutes * 60) {
                        callback.current(Math.round(idleSeconds));
                        lastActivity.current = Date.now();
                    }
                }
            }["useIdleDetector.useEffect.interval"], 1000);
            return ({
                "useIdleDetector.useEffect": ()=>{
                    events.forEach({
                        "useIdleDetector.useEffect": (event)=>window.removeEventListener(event, resetActivity)
                    }["useIdleDetector.useEffect"]);
                    window.clearInterval(interval);
                }
            })["useIdleDetector.useEffect"];
        }
    }["useIdleDetector.useEffect"], [
        thresholdMinutes,
        enabled,
        resetActivity
    ]);
    const simulateIdle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useIdleDetector.useCallback[simulateIdle]": ()=>{
            const seconds = thresholdMinutes * 60;
            lastActivity.current = Date.now();
            callback.current(seconds);
        }
    }["useIdleDetector.useCallback[simulateIdle]"], [
        thresholdMinutes
    ]);
    return {
        resetActivity,
        simulateIdle
    };
}
_s(useIdleDetector, "v09Q9MgjvVYU1OvKjQZrZGt0oSU=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/hooks/useTimer.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TimerProvider",
    ()=>TimerProvider,
    "formatDuration",
    ()=>formatDuration,
    "useTimer",
    ()=>useTimer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$subscription$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/subscription.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$hooks$2f$useIdleDetector$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/hooks/useIdleDetector.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/api.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const TimerContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const initial = {
    status: "stopped",
    elapsed: 0,
    idle: 0,
    startedAt: null,
    task: "Product strategy",
    category: "Productive",
    lastSession: 0,
    sessionId: null
};
const currentElapsed = (data)=>data.elapsed + (data.status === "running" && data.startedAt ? (Date.now() - data.startedAt) / 1000 : 0);
const settled = (data)=>({
        ...data,
        elapsed: currentElapsed(data),
        startedAt: data.status === "running" ? Date.now() : null
    });
function reportFailure(error) {
    const message = error instanceof Error ? error.message : "The activity request failed.";
    window.dispatchEvent(new CustomEvent("pulse:api-error", {
        detail: message
    }));
}
function TimerProvider({ children }) {
    _s();
    const { authenticated, canUseApp, user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$subscription$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSubscription"])();
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initial);
    const dataRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(data);
    const [elapsedSeconds, setElapsedSeconds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [threshold, setThreshold] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(5);
    const [idleOpen, setIdleOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [idleDuration, setIdleDuration] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const autoStarted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const pendingStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const resumeAfterVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TimerProvider.useEffect": ()=>{
            setData(initial);
            dataRef.current = initial;
            setElapsedSeconds(0);
            setThreshold(Math.min(30, Math.max(1, Number(localStorage.getItem("pulse:idleThreshold")) || 5)));
            autoStarted.current = false;
            const settings = {
                "TimerProvider.useEffect.settings": ()=>setThreshold(Math.min(30, Math.max(1, Number(localStorage.getItem("pulse:idleThreshold")) || 5)))
            }["TimerProvider.useEffect.settings"];
            window.addEventListener("pulse:settings", settings);
            return ({
                "TimerProvider.useEffect": ()=>window.removeEventListener("pulse:settings", settings)
            })["TimerProvider.useEffect"];
        }
    }["TimerProvider.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TimerProvider.useEffect": ()=>{
            setData(initial);
            dataRef.current = initial;
            setElapsedSeconds(0);
            if (!authenticated || !canUseApp || !user) return;
            let active = true;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getOpenActivity"])().then({
                "TimerProvider.useEffect": (session)=>{
                    if (!active || !session) return;
                    const current = dataRef.current;
                    const elapsed = current.sessionId === session.id && current.status !== "stopped" ? current.elapsed : session.activeSeconds + session.idleSeconds;
                    const next = {
                        ...current,
                        status: session.status,
                        elapsed,
                        idle: session.idleSeconds,
                        startedAt: session.status === "running" ? Date.now() : null,
                        task: session.task,
                        category: session.category,
                        sessionId: session.id
                    };
                    setData(next);
                    setElapsedSeconds(currentElapsed(next));
                }
            }["TimerProvider.useEffect"]).catch(reportFailure);
            return ({
                "TimerProvider.useEffect": ()=>{
                    active = false;
                }
            })["TimerProvider.useEffect"];
        }
    }["TimerProvider.useEffect"], [
        authenticated,
        canUseApp,
        user?.id
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TimerProvider.useEffect": ()=>{
            dataRef.current = data;
        }
    }["TimerProvider.useEffect"], [
        data
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TimerProvider.useEffect": ()=>{
            const interval = window.setInterval({
                "TimerProvider.useEffect.interval": ()=>setElapsedSeconds(currentElapsed(dataRef.current))
            }["TimerProvider.useEffect.interval"], 1000);
            return ({
                "TimerProvider.useEffect": ()=>window.clearInterval(interval)
            })["TimerProvider.useEffect"];
        }
    }["TimerProvider.useEffect"], []);
    const start = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TimerProvider.useCallback[start]": ()=>{
            if (pendingStart.current || dataRef.current.status === "running") return;
            pendingStart.current = true;
            void ({
                "TimerProvider.useCallback[start]": async ()=>{
                    try {
                        const current = dataRef.current;
                        const session = current.sessionId && current.status === "paused" ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resumeActivity"])(current.sessionId).then({
                            "TimerProvider.useCallback[start]": ()=>({
                                    _id: current.sessionId
                                })
                        }["TimerProvider.useCallback[start]"]) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startActivity"])(current.task, current.category).then({
                            "TimerProvider.useCallback[start]": (result)=>result.session
                        }["TimerProvider.useCallback[start]"]);
                        const next = {
                            ...dataRef.current,
                            status: "running",
                            startedAt: Date.now(),
                            sessionId: session._id
                        };
                        setData(next);
                    } catch (error) {
                        reportFailure(error);
                    } finally{
                        pendingStart.current = false;
                    }
                }
            })["TimerProvider.useCallback[start]"]();
        }
    }["TimerProvider.useCallback[start]"], []);
    const pause = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TimerProvider.useCallback[pause]": ()=>{
            const current = dataRef.current;
            if (current.status !== "running") return;
            void ({
                "TimerProvider.useCallback[pause]": async ()=>{
                    try {
                        if (current.sessionId) await (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pauseActivity"])(current.sessionId);
                        setData({
                            "TimerProvider.useCallback[pause]": (prev)=>({
                                    ...settled(prev),
                                    status: "paused",
                                    startedAt: null
                                })
                        }["TimerProvider.useCallback[pause]"]);
                    } catch (error) {
                        reportFailure(error);
                    }
                }
            })["TimerProvider.useCallback[pause]"]();
        }
    }["TimerProvider.useCallback[pause]"], []);
    const stop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TimerProvider.useCallback[stop]": ()=>{
            const current = dataRef.current;
            if (current.status === "stopped") return;
            void ({
                "TimerProvider.useCallback[stop]": async ()=>{
                    try {
                        if (current.sessionId) await (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stopActivity"])(current.sessionId);
                        setData({
                            "TimerProvider.useCallback[stop]": (prev)=>({
                                    ...prev,
                                    status: "stopped",
                                    elapsed: 0,
                                    startedAt: null,
                                    lastSession: currentElapsed(prev),
                                    sessionId: null
                                })
                        }["TimerProvider.useCallback[stop]"]);
                    } catch (error) {
                        reportFailure(error);
                    }
                }
            })["TimerProvider.useCallback[stop]"]();
        }
    }["TimerProvider.useCallback[stop]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TimerProvider.useEffect": ()=>{
            if (!authenticated || !canUseApp) return;
            const autoStart = {
                "TimerProvider.useEffect.autoStart": (event)=>{
                    if (event.target?.closest(".timer-actions")) return;
                    if (!autoStarted.current && dataRef.current.status === "stopped") {
                        autoStarted.current = true;
                        start();
                    }
                }
            }["TimerProvider.useEffect.autoStart"];
            window.addEventListener("pointerdown", autoStart);
            window.addEventListener("keydown", autoStart);
            return ({
                "TimerProvider.useEffect": ()=>{
                    window.removeEventListener("pointerdown", autoStart);
                    window.removeEventListener("keydown", autoStart);
                }
            })["TimerProvider.useEffect"];
        }
    }["TimerProvider.useEffect"], [
        authenticated,
        canUseApp,
        start
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TimerProvider.useEffect": ()=>{
            const visibility = {
                "TimerProvider.useEffect.visibility": ()=>{
                    if (document.hidden && dataRef.current.status === "running") {
                        resumeAfterVisible.current = true;
                        pause();
                    } else if (!document.hidden && resumeAfterVisible.current) {
                        resumeAfterVisible.current = false;
                        start();
                    }
                }
            }["TimerProvider.useEffect.visibility"];
            const pagehide = {
                "TimerProvider.useEffect.pagehide": ()=>{
                    if (dataRef.current.status === "running" && dataRef.current.sessionId) {
                        void (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["heartbeatActivity"])(dataRef.current.sessionId).catch(reportFailure);
                    }
                }
            }["TimerProvider.useEffect.pagehide"];
            document.addEventListener("visibilitychange", visibility);
            window.addEventListener("pagehide", pagehide);
            return ({
                "TimerProvider.useEffect": ()=>{
                    document.removeEventListener("visibilitychange", visibility);
                    window.removeEventListener("pagehide", pagehide);
                }
            })["TimerProvider.useEffect"];
        }
    }["TimerProvider.useEffect"], [
        pause,
        start
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TimerProvider.useEffect": ()=>{
            if (data.status !== "running" || !data.sessionId) return;
            const timer = window.setInterval({
                "TimerProvider.useEffect.timer": ()=>{
                    void (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["heartbeatActivity"])(data.sessionId).catch(reportFailure);
                }
            }["TimerProvider.useEffect.timer"], 15_000);
            return ({
                "TimerProvider.useEffect": ()=>window.clearInterval(timer)
            })["TimerProvider.useEffect"];
        }
    }["TimerProvider.useEffect"], [
        data.status,
        data.sessionId
    ]);
    const idleHandler = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TimerProvider.useCallback[idleHandler]": (seconds)=>{
            setIdleDuration(seconds);
            setIdleOpen(true);
            if (dataRef.current.sessionId) void (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setActivityIdle"])(dataRef.current.sessionId, true).catch(reportFailure);
        }
    }["TimerProvider.useCallback[idleHandler]"], []);
    const { resetActivity, simulateIdle } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$hooks$2f$useIdleDetector$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIdleDetector"])(threshold, data.status === "running" && !idleOpen, idleHandler);
    const closeIdle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TimerProvider.useCallback[closeIdle]": ()=>{
            setIdleOpen(false);
            resetActivity();
        }
    }["TimerProvider.useCallback[closeIdle]"], [
        resetActivity
    ]);
    const keepIdle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TimerProvider.useCallback[keepIdle]": ()=>{
            if (dataRef.current.sessionId) void (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setActivityIdle"])(dataRef.current.sessionId, false).catch(reportFailure);
            closeIdle();
        }
    }["TimerProvider.useCallback[keepIdle]"], [
        closeIdle
    ]);
    const discardIdle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TimerProvider.useCallback[discardIdle]": ()=>{
            if (dataRef.current.sessionId) void (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setActivityIdle"])(dataRef.current.sessionId, false).catch(reportFailure);
            setData({
                "TimerProvider.useCallback[discardIdle]": (prev)=>{
                    const next = settled(prev);
                    return {
                        ...next,
                        elapsed: Math.max(0, next.elapsed - idleDuration),
                        idle: next.idle + idleDuration
                    };
                }
            }["TimerProvider.useCallback[discardIdle]"]);
            closeIdle();
        }
    }["TimerProvider.useCallback[discardIdle]"], [
        closeIdle,
        idleDuration
    ]);
    const takeBreak = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TimerProvider.useCallback[takeBreak]": ()=>{
            const current = dataRef.current;
            if (current.sessionId) void Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setActivityIdle"])(current.sessionId, false),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pauseActivity"])(current.sessionId)
            ]).catch(reportFailure);
            setData({
                "TimerProvider.useCallback[takeBreak]": (prev)=>{
                    const next = settled(prev);
                    return {
                        ...next,
                        status: "paused",
                        startedAt: null,
                        elapsed: Math.max(0, next.elapsed - idleDuration),
                        idle: next.idle + idleDuration
                    };
                }
            }["TimerProvider.useCallback[takeBreak]"]);
            closeIdle();
        }
    }["TimerProvider.useCallback[takeBreak]"], [
        closeIdle,
        idleDuration
    ]);
    const value = {
        ...data,
        elapsedSeconds,
        idleOpen,
        idleDuration,
        start,
        pause,
        stop,
        setTask: (task)=>setData((prev)=>({
                    ...prev,
                    task
                })),
        setCategory: (category)=>{
            setData((prev)=>({
                    ...prev,
                    category
                }));
            if (dataRef.current.sessionId) void (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateActivityCategory"])(dataRef.current.sessionId, category).catch(reportFailure);
        },
        keepIdle,
        discardIdle,
        takeBreak,
        simulateIdle
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TimerContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/frontend/hooks/useTimer.jsx",
        lineNumber: 213,
        columnNumber: 12
    }, this);
}
_s(TimerProvider, "3y+8sOAc/57EWEkvI5yJwPvQE7I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$subscription$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSubscription"],
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$hooks$2f$useIdleDetector$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIdleDetector"]
    ];
});
_c = TimerProvider;
function useTimer() {
    _s1();
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(TimerContext);
    if (!value) throw new Error("useTimer must be used inside TimerProvider");
    return value;
}
_s1(useTimer, "ksutO2/Ix3UeCrGnhyM+QEP505Y=");
function formatDuration(totalSeconds) {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = seconds % 60;
    return [
        h,
        m,
        s
    ].map((n)=>String(n).padStart(2, "0")).join(":");
}
var _c;
__turbopack_context__.k.register(_c, "TimerProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);})()

//# sourceMappingURL=frontend_1hvx7_wx82ewd._.js.map