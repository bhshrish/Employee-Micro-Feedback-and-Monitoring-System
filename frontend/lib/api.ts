export interface AuthUser {
    id: string;
    name: string;
    email: string;
    organizationId: string;
    teamId: string | null;
    role: "individual" | "business" | "admin";
    subscription: {
        plan: string;
        status: string;
        trialEndsAt: string | Date;
    };
}

interface HeatmapCell {
    teamId: string;
    weekStart: string;
    riskScore: number;
}

interface HeatmapResponse {
    teams: { teamId: string; name: string }[];
    cells: HeatmapCell[];
}

interface PulseTeam {
    teamId: string;
    name: string;
    mood: number | null;
    stress: number | null;
    workload: number | null;
    burnoutScore: number | null;
    exhaustion: number | null;
    recovery: number | null;
    control: number | null;
    support: number | null;
    participation: number;
    responses: number;
    trend: { mood: number }[];
}

interface PulseTeamsResponse {
    minimumGroupSize: number;
    teams: PulseTeam[];
}

interface AnalyticsTeamsResponse {
    teams: { suppressed: boolean }[];
}

interface AlertsResponse {
    alerts: {
        _id: string;
        title: string;
        detail: string;
        severity: string;
        createdAt: string;
        status: string;
    }[];
}

export interface TeamData {
    minimumGroupSize: number;
    suppressedTeams: number;
    heatmapTeams: { id: string; name: string }[];
    teams: {
        id: string;
        name: string;
        mood: number | null;
        stress: number | null;
        workload: number | null;
        burnoutScore: number | null;
        exhaustion?: number | null;
        recovery?: number | null;
        control?: number | null;
        support?: number | null;
        participation: number;
        responses: number;
        trend: number[];
    }[];
    alerts: {
        id: string;
        title: string;
        detail: string;
        severity: string;
        time: string;
        status: string;
    }[];
    heatmap: HeatmapCell[];
}

interface ReportResponse {
    report: {
        downloadUrl: string;
        filename?: string;
    };
}

type UnknownRecord = Record<string, unknown>;

interface ApiErrorResponse {
    error?: {
        code?: string;
        message?: string;
        details?: {
            formErrors?: string[];
            fieldErrors?: Record<string, string[]>;
        };
    };
}

interface AuthResponse {
    user: AuthUser;
    accessToken?: string;
}

interface AdminTokenResponse {
    token?: string;
}

interface CurrentUserResponse {
    user: AuthUser;
}

export interface AttendanceRecord {
    _id: string;
    checkedInAt: string;
    checkedOutAt: string | null;
    durationSeconds: number | null;
}

export interface MyAttendance {
    current: Pick<AttendanceRecord, "checkedInAt"> | null;
    records: AttendanceRecord[];
}

interface SessionActivity {
    id: string;
    startedAt: string;
    activeSeconds: number;
    idleSeconds: number;
    category: "Productive" | "Neutral" | "Distracting";
    status: "running" | "paused" | "stopped";
    pausedAt?: string | null;
    pausedSeconds?: number;
    task: string;
}

interface ActivitySessionResponse {
    session: { _id: string };
}

interface DailyActivity {
    date: string;
    active: number;
    idle: number;
    productive: number;
    neutral: number;
}

interface DashboardSnapshot {
    sessions: SessionActivity[];
    daily: DailyActivity[];
}

interface ApiRequestInit extends RequestInit {
    responseType?: "blob";
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1").replace(/\/$/, "");
let refreshRequest: Promise<boolean> | null = null;
let dashboardRequest: Promise<DashboardSnapshot> | null = null;
let currentAccessToken = typeof window !== "undefined" ? localStorage.getItem("calmwork:access-token") : null;
let currentAdminToken = typeof window !== "undefined" ? localStorage.getItem("calmwork:admin-token") : null;

export function setAccessToken(token: string | null | undefined): void {
    currentAccessToken = token || null;
    if (typeof window !== "undefined") {
        if (token)
            localStorage.setItem("calmwork:access-token", token);
        else
            localStorage.removeItem("calmwork:access-token");
    }
}

export function setAdminToken(token: string | null | undefined): void {
    currentAdminToken = token || null;
    if (typeof window !== "undefined") {
        if (token)
            localStorage.setItem("calmwork:admin-token", token);
        else
            localStorage.removeItem("calmwork:admin-token");
    }
}
function isAuthPath(path: string): boolean {
    return path.startsWith("/auth/otp/") ||
        ["/auth/refresh", "/auth/signin", "/auth/login", "/auth/signup", "/auth/signup/session", "/auth/accept-invitation", "/auth/accept-invitation/session", "/auth/forgot-password", "/auth/reset-password", "/auth/email-change/verify"].includes(path) ||
        path.startsWith("/operations/auth/otp/");
}
function apiError(status: number, code: string, message: string): Error & { status: number; code: string } {
    return Object.assign(new Error(message), { status, code });
}
async function fetchApi(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    try {
        return await fetch(input, init);
    }
    catch (error) {
        if (!(error instanceof TypeError))
            throw error;
        throw apiError(0, "API_UNAVAILABLE", `Can't reach the CalmWork API at ${API_BASE}. Start MongoDB and run \`npm run api:dev\` after configuring backend/.env. For a remote API, set NEXT_PUBLIC_API_URL and allow this site's origin in CORS_ORIGINS.`);
    }
}
async function refreshAccessToken(): Promise<boolean> {
    if (refreshRequest)
        return refreshRequest;
    const pending = (async () => {
        const response = await fetchApi(`${API_BASE}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        });
        const payload = await response.json().catch(() => ({})) as ApiErrorResponse & { accessToken?: string };
        if (!response.ok) {
            if (response.status === 401) {
                setAccessToken(null);
                localStorage.removeItem("calmwork:auth");
                window.dispatchEvent(new Event("calmwork:session-expired"));
            }
            throw apiError(response.status, payload.error?.code || "AUTH_REQUIRED", payload.error?.message || "Your session has expired. Please sign in again.");
        }
        if (payload.accessToken) {
            setAccessToken(payload.accessToken);
        }
        return true;
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
function request(path: string, init: ApiRequestInit & { responseType: "blob" }, canRefresh?: boolean): Promise<Blob>;
function request<T = UnknownRecord>(path: string, init?: ApiRequestInit, canRefresh?: boolean): Promise<T | undefined>;
async function request<T = UnknownRecord>(
    path: string,
    init: ApiRequestInit = {},
    canRefresh = true,
): Promise<T | Blob | undefined> {
    const responseType = init.responseType;
    const requestInit = { ...init };
    delete requestInit.responseType;
    const headers = new Headers(init.headers);
    if (init.body && !headers.has("Content-Type"))
        headers.set("Content-Type", "application/json");
    if (!headers.has("Authorization")) {
        if (path.startsWith("/operations") && currentAdminToken) {
            headers.set("Authorization", `Bearer ${currentAdminToken}`);
        } else if (currentAccessToken) {
            headers.set("Authorization", `Bearer ${currentAccessToken}`);
        }
    }
    const response = await fetchApi(`${API_BASE}${path}`, { ...requestInit, headers, credentials: "include" });
    if (response.status === 401 && canRefresh && !isAuthPath(path)) {
        await refreshAccessToken();
        return request(path, init, false);
    }
    if (response.status === 204)
        return undefined;
    if (responseType === "blob" && response.ok)
        return response.blob();
    const contentType = response.headers.get("content-type") || "";
    const payload: unknown = contentType.includes("application/json")
        ? await response.json()
        : await response.text();
    if (!response.ok) {
        const body = typeof payload === "object" && payload !== null && !Array.isArray(payload)
            ? payload as ApiErrorResponse
            : {};
        const validationDetails = body.error?.details;
        const validationMessages = [
            ...(validationDetails?.formErrors ?? []),
            ...Object.entries(validationDetails?.fieldErrors ?? {})
                .flatMap(([field, messages]) => messages.map((message) => `${field}: ${message}`)),
        ];
        const message = body.error?.message || `Request failed (${response.status})`;
        throw apiError(
            response.status,
            body.error?.code || "REQUEST_FAILED",
            validationMessages.length ? `${message} (${validationMessages.join("; ")})` : message,
        );
    }
    return payload as T;
}

async function requestRequired<T = UnknownRecord>(
    path: string,
    init: ApiRequestInit = {},
    canRefresh = true,
): Promise<T> {
    const result = await request<T>(path, init, canRefresh);
    if (result === undefined)
        throw apiError(502, "EMPTY_RESPONSE", "The CalmWork API returned an empty response.");
    return result;
}
export async function requestOtp(input: { email: string }) {
    return request("/auth/otp/request", { method: "POST", body: JSON.stringify(input) }, false);
}
export async function verifyOtp(input: { email: string; code: string }): Promise<AuthUser> {
    const result = await requestRequired<AuthResponse>("/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify(input),
    }, false);
    if (result.accessToken)
        setAccessToken(result.accessToken);
    localStorage.setItem("calmwork:auth", "true");
    return result.user;
}
export async function signup(input: { name: string; email: string; password: string; accountType: "individual" | "business" }) {
    return request("/auth/signup", { method: "POST", body: JSON.stringify(input) }, false);
}
export async function signupWithSession(input: { name: string; email: string; password: string; accountType: "individual" | "business" }): Promise<AuthUser> {
    const result = await requestRequired<AuthResponse>("/auth/signup/session", { method: "POST", body: JSON.stringify(input) }, false);
    if (result.accessToken)
        setAccessToken(result.accessToken);
    localStorage.setItem("calmwork:auth", "true");
    return result.user;
}
export async function signInWithPassword(input: { email: string; password: string; accountType: "individual" | "business" }): Promise<AuthUser> {
    const result = await requestRequired<AuthResponse>("/auth/signin", { method: "POST", body: JSON.stringify(input) }, false);
    if (result.accessToken)
        setAccessToken(result.accessToken);
    localStorage.setItem("calmwork:auth", "true");
    return result.user;
}
export async function acceptInvitation(input: { email: string; code: string; name: string; password: string }) {
    return request("/auth/accept-invitation", { method: "POST", body: JSON.stringify(input) }, false);
}
export async function acceptInvitationWithSession(input: { email: string; code: string; name: string; password: string }): Promise<AuthUser> {
    const result = await requestRequired<AuthResponse>("/auth/accept-invitation/session", { method: "POST", body: JSON.stringify(input) }, false);
    if (result.accessToken)
        setAccessToken(result.accessToken);
    localStorage.setItem("calmwork:auth", "true");
    return result.user;
}
export async function requestPasswordReset(email: string) {
    return request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }, false);
}
export async function resetPassword(input: { token: string; password: string }) {
    return request("/auth/reset-password", { method: "POST", body: JSON.stringify(input) }, false);
}
export async function verifyEmailChange(token: string) {
    return request("/auth/email-change/verify", { method: "POST", body: JSON.stringify({ token }) }, false);
}
export async function requestAdminOtp(email: string) {
    return request("/operations/auth/otp/request", { method: "POST", body: JSON.stringify({ email }) }, false);
}
export async function verifyAdminOtp(email: string, code: string) {
    const result = await requestRequired<AdminTokenResponse>("/operations/auth/otp/verify", { method: "POST", body: JSON.stringify({ email, code }) }, false);
    if (result?.token)
        setAdminToken(result.token);
    return result;
}
export async function loginOperationsAdmin(email: string, password: string) {
    const result = await requestRequired<AdminTokenResponse>("/operations/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }, false);
    if (result?.token)
        setAdminToken(result.token);
    return result;
}
export async function getOperationsAdmin() {
    return request("/operations/auth/me", {}, false);
}
export async function signOutOperationsAdmin() {
    try {
        return await request("/operations/auth/logout", { method: "POST" }, false);
    }
    finally {
        setAdminToken(null);
    }
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
export async function setOperationsBusinessActive(id: string, isActive: boolean) {
    return request(`/operations/businesses/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
    }, false);
}
export async function getOperationsUsers(page = 1, q = "", role = "") {
    const query = new URLSearchParams({ page: String(page) });
    if (q)
        query.set("q", q);
    if (role)
        query.set("role", role);
    return request(`/operations/users?${query}`, {}, false);
}
export async function setOperationsUserActive(id: string, isActive: boolean) {
    return request(`/operations/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
    }, false);
}
export async function getOperationsTeams() {
    return request("/operations/teams", {}, false);
}
export async function createOperationsTeam(organizationId: string, name: string) {
    return request("/operations/teams", {
        method: "POST",
        body: JSON.stringify({ organizationId, name }),
    }, false);
}
export async function archiveOperationsTeam(teamId: string) {
    return request(`/operations/teams/${encodeURIComponent(teamId)}`, { method: "DELETE" }, false);
}
export async function assignOperationsTeam(userId: string, teamId: string | null) {
    return request(`/operations/users/${encodeURIComponent(userId)}/team`, {
        method: "PATCH",
        body: JSON.stringify({ teamId }),
    }, false);
}
export async function getOperationsActivity(date: string) {
    return request(`/operations/activity?date=${encodeURIComponent(date)}`, {}, false);
}
export async function getOperationsAttendance(date: string, page = 1) {
    const query = new URLSearchParams({ date, page: String(page) });
    return request(`/operations/attendance?${query}`, {}, false);
}
export async function exportOperationsAttendance(date: string) {
    const response = await fetchApi(`${API_BASE}/operations/attendance/export?date=${encodeURIComponent(date)}`, { credentials: "include" });
    if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw apiError(response.status, payload.error?.code || "EXPORT_FAILED", payload.error?.message || "Could not export attendance.");
    }
    return response.blob();
}
export async function getOperationsLeave() {
    const result = await requestRequired("/operations/leave", {}, false);
    return result.requests;
}
export async function decideOperationsLeave(toolId: string, status: string) {
    const result = await requestRequired(`/operations/leave/${encodeURIComponent(toolId)}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    }, false);
    return result.request;
}
export async function getWorkspaceTeams() {
    return request("/workspace/teams");
}
export async function getWorkspaceMembers() {
    return request("/workspace/members");
}
export async function createWorkspaceTeam(name: string) {
    return request("/workspace/teams", { method: "POST", body: JSON.stringify({ name }) });
}
export async function inviteWorkspaceMember(email: string, teamId: string) {
    return request("/workspace/invitations", { method: "POST", body: JSON.stringify({ email, teamId }) });
}
export async function updateWorkspaceMember(memberId: string, input: UnknownRecord) {
    return request(`/workspace/members/${encodeURIComponent(memberId)}`, { method: "PATCH", body: JSON.stringify(input) });
}
export async function archiveWorkspaceTeam(teamId: string) {
    return request(`/workspace/teams/${encodeURIComponent(teamId)}`, { method: "DELETE" });
}
export async function getMyAttendance(): Promise<MyAttendance> {
    return requestRequired<MyAttendance>("/attendance/me");
}
export async function checkInAttendance() {
    return request("/attendance/check-in", { method: "POST", body: JSON.stringify({}) });
}
export async function checkOutAttendance() {
    return request("/attendance/check-out", { method: "POST", body: JSON.stringify({}) });
}
export async function getToolPlanner() {
    const result = await requestRequired("/tools/planner");
    return result.tasks;
}
export async function createToolPlanner(input: UnknownRecord) {
    const result = await requestRequired("/tools/planner", { method: "POST", body: JSON.stringify(input) });
    return result.task;
}
export async function updateToolPlanner(toolId: string, input: UnknownRecord) {
    const result = await requestRequired(`/tools/planner/${encodeURIComponent(toolId)}`, { method: "PATCH", body: JSON.stringify(input) });
    return result.task;
}
export async function deleteToolPlanner(toolId: string) {
    return request(`/tools/planner/${encodeURIComponent(toolId)}`, { method: "DELETE" });
}
export async function getToolLeave() {
    const result = await requestRequired("/tools/leave");
    return result.requests;
}
export async function createToolLeave(input: UnknownRecord) {
    const result = await requestRequired("/tools/leave", { method: "POST", body: JSON.stringify(input) });
    return result.request;
}
export async function decideToolLeave(toolId: string, status: string) {
    const result = await requestRequired(`/tools/leave/${encodeURIComponent(toolId)}/decision`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
    return result.request;
}
export async function getToolCalendar() {
    const result = await requestRequired("/tools/calendar");
    return result.events;
}
export async function createToolCalendarEvent(input: UnknownRecord) {
    const result = await requestRequired("/tools/calendar", { method: "POST", body: JSON.stringify(input) });
    return result.event;
}
export async function restoreSession() {
    if (localStorage.getItem("calmwork:auth") !== "true")
        return null;
    try {
        const result = await requestRequired<CurrentUserResponse>("/auth/me");
        return result.user;
    }
    catch (error) {
        if (error instanceof Error && "status" in error && error.status === 401) {
            setAccessToken(null);
            localStorage.removeItem("calmwork:auth");
            return null;
        }
        throw error;
    }
}
export async function signOut(everywhere = false) {
    try {
        if (everywhere)
            await request("/auth/logout-all", { method: "POST" });
        else
            await request("/auth/logout", { method: "POST" });
    }
    finally {
        setAccessToken(null);
        localStorage.removeItem("calmwork:auth");
    }
}
export async function updateProfile(input: UnknownRecord) {
    return request("/auth/me", { method: "PATCH", body: JSON.stringify(input) });
}
function hours(seconds: number): string {
    return `${(seconds / 3600).toFixed(1)}h`;
}
function minutes(seconds: number): string {
    return `${Math.round(seconds / 60)}m`;
}
async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
    if (dashboardRequest)
        return dashboardRequest;
    const pending = requestRequired<DashboardSnapshot>("/dashboard?range=30d");
    dashboardRequest = pending;
    try {
        return await pending;
    }
    finally {
        if (dashboardRequest === pending)
            dashboardRequest = null;
    }
}
export interface DashboardData {
    kpis: {
        total: string;
        active: string;
        idle: string;
        productive: number;
        weekly: string;
        streak: number;
    };
    sessions: number;
    productiveHours: number;
    neutralHours: number;
    daily: { label: string; active: number; idle: number }[];
    weekly: { day: string; productive: number; neutral: number; idle: number }[];
    trend: number[];
}

export async function getDashboardData(range: "Today" | "7d" | "30d"): Promise<DashboardData> {
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
export async function getHeatmapData(weeks: number, teamId?: string) {
    const query = new URLSearchParams({ weeks: String(weeks) });
    if (teamId)
        query.set("teamId", teamId);
    const result = await requestRequired<HeatmapResponse>(`/analytics/heatmap?${query}`);
    return {
        teams: result.teams.map((team) => ({ id: team.teamId, name: team.name })),
        cells: result.cells,
    };
}
export async function getTeamData(): Promise<TeamData> {
    const [scores, analytics, alerts, heatmap] = await Promise.all([
        requestRequired<PulseTeamsResponse>("/pulse/teams"),
        requestRequired<AnalyticsTeamsResponse>("/analytics/teams"),
        requestRequired<AlertsResponse>("/alerts?status=open"),
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
            burnoutScore: team.burnoutScore,
            exhaustion: team.exhaustion,
            recovery: team.recovery,
            control: team.control,
            support: team.support,
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
export async function updateAlert(id: string, status: string) {
    return request(`/alerts/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status }) });
}
export async function submitPulse(payload: UnknownRecord) {
    return request("/pulse", { method: "POST", body: JSON.stringify(payload) });
}
export async function getPulseStatus() {
    return request("/pulse/me");
}
export async function getReportSummary(period: string, metrics: string[]) {
    const periodKey = period.toLowerCase().replace("last ", "").replace(" days", "d").replace(" day", "d").replace("quarter", "quarter");
    const response = await request(`/reports/preview?period=${encodeURIComponent(periodKey)}&metrics=${encodeURIComponent(metrics.join(","))}`);
    return response;
}
function reportPeriodKey(period: string): string {
    return period.toLowerCase().replace("last ", "").replace(" days", "d").replace(" day", "d");
}
export async function downloadReport(period: string, metrics: string[], format: string) {
    const result = await requestRequired<ReportResponse>("/reports/generate", {
        method: "POST",
        body: JSON.stringify({
            period: reportPeriodKey(period),
            metrics,
            format: format.toLowerCase(),
        }),
    });
    const blob = await request(result.report.downloadUrl, {
        responseType: "blob",
    });
    return { blob, filename: result.report.filename || `calmwork-report.${format.toLowerCase()}` };
}
export async function startActivity(task: string, category: string): Promise<ActivitySessionResponse> {
    return requestRequired<ActivitySessionResponse>("/sessions/start", { method: "POST", body: JSON.stringify({ task, category }) });
}
export async function getOpenActivity(): Promise<SessionActivity | null> {
    const result = await getDashboardSnapshot();
    return result.sessions.find((item) => item.status === "running" || item.status === "paused") ?? null;
}
export async function pauseActivity(id: string) {
    return request(`/sessions/${encodeURIComponent(id)}/pause`, { method: "POST" });
}
export async function resumeActivity(id: string) {
    return request(`/sessions/${encodeURIComponent(id)}/resume`, { method: "POST" });
}
export async function stopActivity(id: string) {
    return request(`/sessions/${encodeURIComponent(id)}/stop`, { method: "POST", body: JSON.stringify({}) });
}
export async function setActivityIdle(id: string, idle: boolean) {
    return request(`/sessions/${encodeURIComponent(id)}/idle`, { method: "POST", body: JSON.stringify({ idle }) });
}
export async function updateActivityCategory(id: string, category: string) {
    return request(`/sessions/${encodeURIComponent(id)}/tags`, { method: "PATCH", body: JSON.stringify({ tags: [], category }) });
}
export async function updateActivityTask(id: string, task: string) {
    return request(`/sessions/${encodeURIComponent(id)}/tags`, { method: "PATCH", body: JSON.stringify({ tags: [], task }) });
}
export async function heartbeatActivity(id: string) {
    return request(`/sessions/${encodeURIComponent(id)}/heartbeat`, { method: "POST" });
}
type QueryValue = string | number | boolean | null | undefined;
function adminQuery(params: Record<string, QueryValue> = {}): string {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "")
            query.set(key, String(value));
    });
    const serialized = query.toString();
    return serialized ? `?${serialized}` : "";
}
export async function getAdminOverview() {
    const result = await requestRequired("/admin/overview");
    return result.overview;
}
export async function getAdminMembers(params: Record<string, QueryValue> = {}) {
    return request(`/admin/members${adminQuery(params)}`);
}
export async function updateAdminMember(userId: string, input: UnknownRecord) {
    return request(`/admin/members/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}
export async function getAdminInvitations() {
    const result = await requestRequired("/admin/invitations");
    return result.invitations;
}
export async function createAdminInvitation(email: string, teamId: string) {
    const result = await requestRequired("/admin/invitations", {
        method: "POST",
        body: JSON.stringify({ email, teamId, role: "individual" }),
    });
    return result.invitation;
}
export async function resendAdminInvitation(email: string) {
    const result = await requestRequired(`/admin/invitations/${encodeURIComponent(email)}/resend`, { method: "POST" });
    return result.invitation;
}
export async function cancelAdminInvitation(invitationId: string) {
    return request(`/admin/invitations/${encodeURIComponent(invitationId)}`, { method: "DELETE" });
}
export async function getAdminTeams() {
    const result = await requestRequired("/admin/teams");
    return result.teams;
}
export async function createAdminTeam(name: string) {
    const result = await requestRequired("/admin/teams", { method: "POST", body: JSON.stringify({ name }) });
    return result.team;
}
export async function renameAdminTeam(teamId: string, name: string) {
    const result = await requestRequired(`/admin/teams/${encodeURIComponent(teamId)}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
    });
    return result.team;
}
export async function archiveAdminTeam(teamId: string) {
    return request(`/admin/teams/${encodeURIComponent(teamId)}`, { method: "DELETE" });
}
export async function getAdminAlerts(params: Record<string, QueryValue> = {}) {
    return request(`/admin/alerts${adminQuery(params)}`);
}
export async function updateAdminAlert(alertId: string, status: string) {
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
export async function updateAdminSettings(input: UnknownRecord) {
    return request("/admin/settings", { method: "PATCH", body: JSON.stringify(input) });
}
export async function getAdminAuditLogs(params: Record<string, QueryValue> = {}) {
    return request(`/admin/audit-logs${adminQuery(params)}`);
}
