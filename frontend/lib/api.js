const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1").replace(/\/$/, "");
let accessToken = null;
let refreshRequest = null;
export function setAccessToken(token) {
    accessToken = token;
}
function isAuthPath(path) {
    return path.startsWith("/auth/signin") || path.startsWith("/auth/signup") || path.startsWith("/auth/refresh");
}
function apiError(status, code, message) {
    return Object.assign(new Error(message), { status, code });
}
async function fetchApi(input, init) {
    try {
        return await fetch(input, init);
    }
    catch (error) {
        if (!(error instanceof TypeError))
            throw error;
        throw apiError(0, "API_UNAVAILABLE", `Can't reach the PULSE API at ${API_BASE}. Start MongoDB and run \`npm run api:dev\` after configuring backend/.env. For a remote API, set NEXT_PUBLIC_API_URL and allow this site's origin in CORS_ORIGINS.`);
    }
}
async function refreshAccessToken() {
    if (refreshRequest)
        return refreshRequest;
    const pending = (async () => {
        const response = await fetchApi(`${API_BASE}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.accessToken) {
            accessToken = null;
            if (response.status === 401) {
                localStorage.removeItem("pulse:auth");
                window.dispatchEvent(new Event("pulse:session-expired"));
            }
            throw apiError(response.status, payload.error?.code || "AUTH_REQUIRED", payload.error?.message || "Your session has expired. Please sign in again.");
        }
        accessToken = payload.accessToken;
        return accessToken;
    })();
    refreshRequest = pending;
    try {
        return await pending;
    }
    finally {
        if (refreshRequest === pending)
            refreshRequest = null;
    }
}
async function request(path, init = {}, canRefresh = true) {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has("Content-Type"))
        headers.set("Content-Type", "application/json");
    if (accessToken)
        headers.set("Authorization", `Bearer ${accessToken}`);
    const response = await fetchApi(`${API_BASE}${path}`, { ...init, headers, credentials: "include" });
    if (response.status === 401 && canRefresh && !isAuthPath(path) && accessToken) {
        await refreshAccessToken();
        return request(path, init, false);
    }
    if (response.status === 204)
        return undefined;
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();
    if (!response.ok) {
        const body = payload;
        throw apiError(response.status, body.error?.code || "REQUEST_FAILED", body.error?.message || `Request failed (${response.status})`);
    }
    return payload;
}
export async function authenticate(email, password, mode, name) {
    const result = await request(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(mode === "signup" ? { name, email, password } : { email, password }),
    }, false);
    setAccessToken(result.accessToken);
    localStorage.setItem("pulse:auth", "true");
    return result.user;
}
export async function restoreSession() {
    if (localStorage.getItem("pulse:auth") !== "true")
        return null;
    try {
        await refreshAccessToken();
        const result = await request("/auth/me");
        return result.user;
    }
    catch (error) {
        if (error instanceof Error && "status" in error && error.status === 401) {
            localStorage.removeItem("pulse:auth");
            setAccessToken(null);
            return null;
        }
        throw error;
    }
}
export async function signOut(everywhere = false) {
    try {
        if (everywhere && accessToken)
            await request("/auth/logout-all", { method: "POST" });
        else
            await request("/auth/logout", { method: "POST" });
    }
    finally {
        setAccessToken(null);
        localStorage.removeItem("pulse:auth");
    }
}
export async function updateProfile(input) {
    return request("/auth/me", { method: "PATCH", body: JSON.stringify(input) });
}
export async function getSubscription() {
    return request("/billing/subscription");
}
function hours(seconds) {
    return `${(seconds / 3600).toFixed(1)}h`;
}
function minutes(seconds) {
    return `${Math.round(seconds / 60)}m`;
}
export async function getDashboardData(range) {
    const [response, weeklyData, streakData] = await Promise.all([
        request(`/dashboard?range=${range.toLowerCase()}`),
        range === "7d" ? Promise.resolve(null) : request("/dashboard?range=7d"),
        range === "30d" ? Promise.resolve(null) : request("/dashboard?range=30d"),
    ]);
    const weeklyResponse = weeklyData ?? response;
    const daily = range === "Today"
        ? Array.from({ length: 24 }, (_, hour) => {
            const bucket = response.sessions.filter((session) => new Date(session.startedAt).getHours() === hour);
            return {
                label: new Date(2000, 0, 1, hour).toLocaleTimeString(undefined, { hour: "numeric" }),
                active: bucket.reduce((sum, session) => sum + session.activeSeconds, 0) / 60,
                idle: bucket.reduce((sum, session) => sum + session.idleSeconds, 0) / 60,
            };
        })
        : response.daily.map((day) => ({
            label: new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(`${day.date}T00:00:00`)),
            active: day.active / 60,
            idle: day.idle / 60,
        }));
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyByDate = new Map(weeklyResponse.daily.map((day) => [day.date, day]));
    const weekEnd = new Date();
    weekEnd.setUTCHours(0, 0, 0, 0);
    const weekly = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekEnd);
        date.setUTCDate(date.getUTCDate() - (6 - index));
        const key = date.toISOString().slice(0, 10);
        const day = dailyByDate.get(key);
        return {
            day: `${weekdays[date.getUTCDay()]} ${key.slice(5)}`,
            productive: (day?.productive ?? 0) / 3600,
            neutral: (day?.neutral ?? 0) / 3600,
            idle: (day?.idle ?? 0) / 3600,
        };
    });
    const productivityByDate = new Map(weeklyResponse.daily.map((day) => [day.date, day]));
    const trend = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setUTCHours(0, 0, 0, 0);
        date.setUTCDate(date.getUTCDate() - (6 - index));
        const day = productivityByDate.get(date.toISOString().slice(0, 10));
        const tracked = (day?.productive ?? 0) + (day?.neutral ?? 0);
        return tracked ? Math.round(((day?.productive ?? 0) / tracked) * 100) : 0;
    });
    const activeDays = new Set((streakData ?? response).sessions.map((session) => session.startedAt.slice(0, 10)));
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    if (!activeDays.has(cursor.toISOString().slice(0, 10)))
        cursor.setDate(cursor.getDate() - 1);
    while (activeDays.has(cursor.toISOString().slice(0, 10))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }
    const lastWeek = weeklyResponse.daily.slice(-7);
    const weeklyTotal = lastWeek.reduce((sum, day) => sum + day.active + day.idle, 0);
    const productiveSeconds = response.sessions
        .filter((session) => session.category === "Productive")
        .reduce((sum, session) => sum + session.activeSeconds, 0);
    const otherActiveSeconds = response.sessions
        .filter((session) => session.category !== "Productive")
        .reduce((sum, session) => sum + session.activeSeconds, 0);
    const activeSeconds = productiveSeconds + otherActiveSeconds;
    return {
        kpis: {
            total: hours(response.summary.totalSeconds),
            active: hours(response.summary.activeSeconds),
            idle: minutes(response.summary.idleSeconds),
            productive: activeSeconds ? Math.round((productiveSeconds / activeSeconds) * 100) : 0,
            weekly: hours(weeklyTotal),
            streak,
        },
        sessions: response.summary.sessionCount,
        productiveHours: productiveSeconds / 3600,
        neutralHours: otherActiveSeconds / 3600,
        daily,
        weekly,
        trend,
    };
}
export async function getHeatmapData(weeks, teamId) {
    const query = new URLSearchParams({ weeks: String(weeks) });
    if (teamId)
        query.set("teamId", teamId);
    const result = await request(`/analytics/heatmap?${query}`);
    return {
        teams: result.teams.map((team) => ({ id: team.teamId, name: team.name })),
        cells: result.cells,
    };
}
export async function getTeamData() {
    const [scores, analytics, alerts, heatmap] = await Promise.all([
        request("/pulse/teams"),
        request("/analytics/teams"),
        request("/alerts?status=open"),
        getHeatmapData(6),
    ]);
    return {
        minimumGroupSize: scores.minimumGroupSize,
        suppressedTeams: analytics.teams.filter((team) => team.suppressed).length,
        heatmapTeams: heatmap.teams,
        teams: scores.teams.map((team) => ({
            id: team.teamId,
            name: team.name,
            mood: team.mood,
            stress: team.stress,
            workload: team.workload,
            participation: team.participation,
            responses: team.responses,
            trend: team.trend.map((week) => week.mood),
        })),
        alerts: alerts.alerts.map((alert) => ({
            id: alert._id,
            title: alert.title,
            detail: alert.detail,
            severity: (alert.severity[0].toUpperCase() + alert.severity.slice(1)),
            time: new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(alert.createdAt)),
            status: alert.status,
        })),
        heatmap: heatmap.cells,
    };
}
export async function updateAlert(id, status) {
    return request(`/alerts/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status }) });
}
export async function submitPulse(payload) {
    return request("/pulse", { method: "POST", body: JSON.stringify(payload) });
}
export async function getPulseStatus() {
    const result = await request("/pulse/me");
    return result.submittedThisWeek;
}
export async function getInvoices() {
    const result = await request("/billing/invoices");
    return result.invoices.map((invoice) => ({
        id: invoice.number || invoice.stripeInvoiceId,
        date: new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(invoice.issuedAt)),
        amount: new Intl.NumberFormat(undefined, { style: "currency", currency: invoice.currency.toUpperCase() }).format(invoice.amountPaid / 100),
        status: invoice.status,
    }));
}
export async function createCheckout(plan, cycle) {
    return request("/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ plan, cycle }),
    });
}
export async function cancelSubscription() {
    return request("/billing/cancel", { method: "POST" });
}
export async function getReportSummary(period, metrics) {
    const periodKey = period.toLowerCase().replace("last ", "").replace(" days", "d").replace(" day", "d").replace("quarter", "quarter");
    const response = await request(`/reports/preview?period=${encodeURIComponent(periodKey)}&metrics=${encodeURIComponent(metrics.join(","))}`);
    return response;
}
export async function downloadReport(period, metrics, format) {
    const periodKey = period.toLowerCase().replace("last ", "").replace(" days", "d").replace(" day", "d");
    const result = await request("/reports/generate", {
        method: "POST",
        body: JSON.stringify({ period: periodKey, metrics, format: format.toLowerCase() }),
    });
    const response = await fetchApi(`${API_BASE}${result.report.downloadUrl}`, {
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw apiError(response.status, "REPORT_DOWNLOAD_FAILED", payload.error?.message || "Could not download the report.");
    }
    return { blob: await response.blob(), filename: response.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1] || `pulse-report.${format.toLowerCase()}` };
}
export async function startActivity(task, category) {
    return request("/sessions/start", { method: "POST", body: JSON.stringify({ task, category }) });
}
export async function getOpenActivity() {
    const result = await request("/dashboard?range=30d");
    return result.sessions.find((item) => item.status === "running" || item.status === "paused") ?? null;
}
export async function pauseActivity(id) {
    return request(`/sessions/${encodeURIComponent(id)}/pause`, { method: "POST" });
}
export async function resumeActivity(id) {
    return request(`/sessions/${encodeURIComponent(id)}/resume`, { method: "POST" });
}
export async function stopActivity(id) {
    return request(`/sessions/${encodeURIComponent(id)}/stop`, { method: "POST", body: JSON.stringify({}) });
}
export async function setActivityIdle(id, idle) {
    return request(`/sessions/${encodeURIComponent(id)}/idle`, { method: "POST", body: JSON.stringify({ idle }) });
}
export async function updateActivityCategory(id, category) {
    return request(`/sessions/${encodeURIComponent(id)}/tags`, { method: "PATCH", body: JSON.stringify({ tags: [], category }) });
}
export async function heartbeatActivity(id) {
    return request(`/sessions/${encodeURIComponent(id)}/heartbeat`, { method: "POST" });
}
export const plans = [
    { name: "Starter", monthly: 8, description: "For individuals building healthier work habits.", features: ["Personal time tracking", "Idle detection", "Weekly pulse", "7-day free trial"] },
    { name: "Team", monthly: 16, description: "For teams turning signals into better support.", features: ["Everything in Starter", "Anonymous team scorecards", "Burnout-risk alerts", "CSV & PDF reports"] },
    { name: "Business", monthly: 28, description: "For organizations supporting every team.", features: ["Everything in Team", "Unlimited teams", "Advanced trends", "Priority support"] },
];
