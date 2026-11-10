const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1").replace(/\/$/, "");
let accessToken = null;
let refreshRequest = null;
let dashboardRequest = null;
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
        throw apiError(0, "API_UNAVAILABLE", `Can't reach the WellTrack API at ${API_BASE}. Start MongoDB and run \`npm run api:dev\` after configuring backend/.env. For a remote API, set NEXT_PUBLIC_API_URL and allow this site's origin in CORS_ORIGINS.`);
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
                localStorage.removeItem("welltrack:auth");
                window.dispatchEvent(new Event("welltrack:session-expired"));
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
export async function authenticate(email, password, mode, name, organizationName) {
    const result = await request(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(mode === "signup" ? { name, email, password, organizationName } : { email, password }),
    }, false);
    if (mode === "signup")
        return result.user;
    setAccessToken(result.accessToken);
    localStorage.setItem("welltrack:auth", "true");
    return result.user;
}
export async function acceptInvitation(input) {
    const result = await request("/auth/accept-invitation", {
        method: "POST",
        body: JSON.stringify(input),
    }, false);
    return result.user;
}
export async function signInOperationsAdmin(username, email, password) {
    return request("/operations/auth/signin", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
    }, false);
}
export async function getOperationsAdmin() {
    return request("/operations/auth/me", {}, false);
}
export async function signOutOperationsAdmin() {
    return request("/operations/auth/logout", { method: "POST" }, false);
}
export async function getOperationsOverview() {
    return request("/operations/overview", {}, false);
}
export async function getOperationsBusinesses(page = 1, q = "") {
    const query = new URLSearchParams({ page: String(page) });
    if (q)
        query.set("q", q);
    return request(`/operations/businesses?${query}`, {}, false);
}
export async function setOperationsBusinessActive(id, isActive) {
    return request(`/operations/businesses/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
    }, false);
}
export async function getOperationsUsers(page = 1, q = "") {
    const query = new URLSearchParams({ page: String(page) });
    if (q)
        query.set("q", q);
    return request(`/operations/users?${query}`, {}, false);
}
export async function setOperationsUserActive(id, isActive) {
    return request(`/operations/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
    }, false);
}
export async function getOperationsTeams() {
    return request("/operations/teams", {}, false);
}
export async function createOperationsTeam(organizationId, name) {
    return request("/operations/teams", {
        method: "POST",
        body: JSON.stringify({ organizationId, name }),
    }, false);
}
export async function archiveOperationsTeam(teamId) {
    return request(`/operations/teams/${encodeURIComponent(teamId)}`, { method: "DELETE" }, false);
}
export async function assignOperationsTeam(userId, teamId) {
    return request(`/operations/users/${encodeURIComponent(userId)}/team`, {
        method: "PATCH",
        body: JSON.stringify({ teamId }),
    }, false);
}
export async function getOperationsActivity(date) {
    return request(`/operations/activity?date=${encodeURIComponent(date)}`, {}, false);
}
export async function getOperationsAttendance(date, page = 1) {
    const query = new URLSearchParams({ date, page: String(page) });
    return request(`/operations/attendance?${query}`, {}, false);
}
export async function exportOperationsAttendance(date) {
    const response = await fetchApi(`${API_BASE}/operations/attendance/export?date=${encodeURIComponent(date)}`, { credentials: "include" });
    if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw apiError(response.status, payload.error?.code || "EXPORT_FAILED", payload.error?.message || "Could not export attendance.");
    }
    return response.blob();
}
export async function getWorkspaceTeams() {
    return request("/workspace/teams");
}
export async function getWorkspaceMembers() {
    return request("/workspace/members");
}
export async function createWorkspaceTeam(name) {
    return request("/workspace/teams", { method: "POST", body: JSON.stringify({ name }) });
}
export async function inviteWorkspaceMember(email, teamId) {
    return request("/workspace/invitations", { method: "POST", body: JSON.stringify({ email, teamId }) });
}
export async function updateWorkspaceMember(memberId, input) {
    return request(`/workspace/members/${encodeURIComponent(memberId)}`, { method: "PATCH", body: JSON.stringify(input) });
}
export async function archiveWorkspaceTeam(teamId) {
    return request(`/workspace/teams/${encodeURIComponent(teamId)}`, { method: "DELETE" });
}
export async function getMyAttendance() {
    return request("/attendance/me");
}
export async function checkInAttendance() {
    return request("/attendance/check-in", { method: "POST", body: JSON.stringify({}) });
}
export async function checkOutAttendance() {
    return request("/attendance/check-out", { method: "POST", body: JSON.stringify({}) });
}
export async function restoreSession() {
    if (localStorage.getItem("welltrack:auth") !== "true")
        return null;
    try {
        await refreshAccessToken();
        const result = await request("/auth/me");
        return result.user;
    }
    catch (error) {
        if (error instanceof Error && "status" in error && error.status === 401) {
            localStorage.removeItem("welltrack:auth");
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
        localStorage.removeItem("welltrack:auth");
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
async function getDashboardSnapshot() {
    if (dashboardRequest)
        return dashboardRequest;
    const pending = request("/dashboard?range=30d");
    dashboardRequest = pending;
    try {
        return await pending;
    }
    finally {
        if (dashboardRequest === pending)
            dashboardRequest = null;
    }
}
export async function getDashboardData(range) {
    const allActivity = await getDashboardSnapshot();
    const now = new Date();
    const start = new Date(now);
    if (range === "Today")
        start.setUTCHours(0, 0, 0, 0);
    else
        start.setUTCDate(start.getUTCDate() - (range === "7d" ? 7 : 30));
    const sessions = allActivity.sessions.filter((session) => {
        const startedAt = new Date(session.startedAt);
        return startedAt >= start && startedAt <= now;
    });
    const summary = sessions.reduce((total, session) => ({
        activeSeconds: total.activeSeconds + session.activeSeconds,
        idleSeconds: total.idleSeconds + session.idleSeconds,
    }), { activeSeconds: 0, idleSeconds: 0 });
    const totalSeconds = summary.activeSeconds + summary.idleSeconds;
    const dailyByDate = new Map();
    for (const session of sessions) {
        const date = session.startedAt.slice(0, 10);
        const day = dailyByDate.get(date) ?? { date, active: 0, idle: 0, productive: 0, neutral: 0 };
        day.active += session.activeSeconds;
        day.idle += session.idleSeconds;
        if (session.category === "Productive")
            day.productive += session.activeSeconds;
        else
            day.neutral += session.activeSeconds;
        dailyByDate.set(date, day);
    }
    const dailySummary = [...dailyByDate.values()].sort((a, b) => a.date.localeCompare(b.date));
    const weekStart = new Date(now);
    weekStart.setUTCHours(0, 0, 0, 0);
    weekStart.setUTCDate(weekStart.getUTCDate() - 6);
    const weeklyDays = allActivity.daily.filter((day) => new Date(`${day.date}T00:00:00.000Z`) >= weekStart);
    const daily = range === "Today"
        ? Array.from({ length: 24 }, (_, hour) => {
            const bucket = sessions.filter((session) => new Date(session.startedAt).getHours() === hour);
            return {
                label: new Date(2000, 0, 1, hour).toLocaleTimeString(undefined, { hour: "numeric" }),
                active: bucket.reduce((sum, session) => sum + session.activeSeconds, 0) / 60,
                idle: bucket.reduce((sum, session) => sum + session.idleSeconds, 0) / 60,
            };
        })
        : dailySummary.map((day) => ({
            label: new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(`${day.date}T00:00:00`)),
            active: day.active / 60,
            idle: day.idle / 60,
        }));
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekEnd = new Date();
    weekEnd.setUTCHours(0, 0, 0, 0);
    const weekly = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekEnd);
        date.setUTCDate(date.getUTCDate() - (6 - index));
        const key = date.toISOString().slice(0, 10);
        const day = dailyByDate.get(key) ?? allActivity.daily.find((item) => item.date === key);
        return {
            day: `${weekdays[date.getUTCDay()]} ${key.slice(5)}`,
            productive: (day?.productive ?? 0) / 3600,
            neutral: (day?.neutral ?? 0) / 3600,
            idle: (day?.idle ?? 0) / 3600,
        };
    });
    const productivityByDate = new Map(weeklyDays.map((day) => [day.date, day]));
    const trend = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setUTCHours(0, 0, 0, 0);
        date.setUTCDate(date.getUTCDate() - (6 - index));
        const day = productivityByDate.get(date.toISOString().slice(0, 10));
        const tracked = (day?.productive ?? 0) + (day?.neutral ?? 0);
        return tracked ? Math.round(((day?.productive ?? 0) / tracked) * 100) : 0;
    });
    const activeDays = new Set(allActivity.sessions.map((session) => session.startedAt.slice(0, 10)));
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    if (!activeDays.has(cursor.toISOString().slice(0, 10)))
        cursor.setDate(cursor.getDate() - 1);
    while (activeDays.has(cursor.toISOString().slice(0, 10))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }
    const weeklyTotal = weeklyDays.reduce((sum, day) => sum + day.active + day.idle, 0);
    const productiveSeconds = sessions
        .filter((session) => session.category === "Productive")
        .reduce((sum, session) => sum + session.activeSeconds, 0);
    const otherActiveSeconds = sessions
        .filter((session) => session.category !== "Productive")
        .reduce((sum, session) => sum + session.activeSeconds, 0);
    const activeSeconds = productiveSeconds + otherActiveSeconds;
    return {
        kpis: {
            total: hours(totalSeconds),
            active: hours(summary.activeSeconds),
            idle: minutes(summary.idleSeconds),
            productive: activeSeconds ? Math.round((productiveSeconds / activeSeconds) * 100) : 0,
            weekly: hours(weeklyTotal),
            streak,
        },
        sessions: sessions.length,
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
    const result = await getDashboardSnapshot();
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
export async function updateActivityTask(id, task) {
    return request(`/sessions/${encodeURIComponent(id)}/tags`, { method: "PATCH", body: JSON.stringify({ tags: [], task }) });
}
export async function heartbeatActivity(id) {
    return request(`/sessions/${encodeURIComponent(id)}/heartbeat`, { method: "POST" });
}
export const plans = [
    { name: "Starter", monthly: 8, description: "For individuals building healthier work habits.", features: ["Personal time tracking", "Idle detection", "Weekly pulse", "7-day free trial"] },
    { name: "Team", monthly: 16, description: "For teams turning signals into better support.", features: ["Everything in Starter", "Anonymous team scorecards", "Burnout-risk alerts", "CSV & PDF reports"] },
    { name: "Business", monthly: 28, description: "For organizations supporting every team.", features: ["Everything in Team", "Unlimited teams", "Advanced trends", "Priority support"] },
];
function adminQuery(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "")
            query.set(key, String(value));
    });
    const serialized = query.toString();
    return serialized ? `?${serialized}` : "";
}
export async function getAdminOverview() {
    const result = await request("/admin/overview");
    return result.overview;
}
export async function getAdminMembers(params = {}) {
    return request(`/admin/members${adminQuery(params)}`);
}
export async function updateAdminMember(userId, input) {
    return request(`/admin/members/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}
export async function getAdminInvitations() {
    const result = await request("/admin/invitations");
    return result.invitations;
}
export async function createAdminInvitation(email, teamId, role) {
    const result = await request("/admin/invitations", {
        method: "POST",
        body: JSON.stringify({ email, teamId, role }),
    });
    return result.invitation;
}
export async function resendAdminInvitation(email) {
    const result = await request(`/admin/invitations/${encodeURIComponent(email)}/resend`, { method: "POST" });
    return result.invitation;
}
export async function cancelAdminInvitation(invitationId) {
    return request(`/admin/invitations/${encodeURIComponent(invitationId)}`, { method: "DELETE" });
}
export async function getAdminTeams() {
    const result = await request("/admin/teams");
    return result.teams;
}
export async function createAdminTeam(name) {
    const result = await request("/admin/teams", { method: "POST", body: JSON.stringify({ name }) });
    return result.team;
}
export async function renameAdminTeam(teamId, name) {
    const result = await request(`/admin/teams/${encodeURIComponent(teamId)}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
    });
    return result.team;
}
export async function archiveAdminTeam(teamId) {
    return request(`/admin/teams/${encodeURIComponent(teamId)}`, { method: "DELETE" });
}
export async function getAdminAlerts(params = {}) {
    return request(`/admin/alerts${adminQuery(params)}`);
}
export async function updateAdminAlert(alertId, status) {
    return request(`/admin/alerts/${encodeURIComponent(alertId)}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
}
export async function getAdminReports(page = 1) {
    return request(`/admin/reports${adminQuery({ page })}`);
}
export async function getAdminSettings() {
    return request("/admin/settings");
}
export async function updateAdminSettings(input) {
    return request("/admin/settings", { method: "PATCH", body: JSON.stringify(input) });
}
export async function getAdminAuditLogs(params = {}) {
    return request(`/admin/audit-logs${adminQuery(params)}`);
}
