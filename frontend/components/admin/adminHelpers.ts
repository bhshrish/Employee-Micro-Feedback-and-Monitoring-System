export const ROLE_LABELS = {
    admin: "Admin",
    business: "Business",
    individual: "Individual",
} as const;

type AdminDate = string | Date | null | undefined;

export interface AdminTeam {
    id: string;
    name: string;
    members: number;
    createdAt: string | Date;
}

export interface AdminMember {
    id: string;
    name: string;
    email: string;
    role: string;
    teamId: string | null;
    isActive: boolean;
    createdAt: string | Date;
}

export interface AdminInvitation {
    id: string;
    email: string;
    role: string;
    teamName?: string | null;
    expiresAt: string | Date;
}

export type AdminAlertStatus = "open" | "acknowledged" | "dismissed";

export interface AdminAlert {
    id: string;
    severity: "high" | "medium" | "low";
    title: string;
    score: number;
    detail: string;
    teamName?: string | null;
    createdAt: string | Date;
    status: AdminAlertStatus;
}

export interface AdminOverviewData {
    businesses: number;
    individuals: number;
    activeMembers: number;
    pendingInvitations: number;
    members: number;
    teams: number;
    pulse: {
        participation: number;
        responses: number;
    };
    openAlerts: number;
    attendance: {
        checkedInToday: number;
        currentlyIn: number;
    };
}

export interface AdminMemberChanges extends Record<string, unknown> {
    role?: string;
    teamId?: string | null;
    isActive?: boolean;
}

export const STATUS_FILTERS = [
    { value: "", label: "All accounts" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Deactivated" },
];

export const ROLE_FILTERS = [
    { value: "", label: "All roles" },
    { value: "business", label: "Business" },
    { value: "individual", label: "Individual" },
];

export const ALERT_FILTERS = [
    { value: "open", label: "Open" },
    { value: "acknowledged", label: "Acknowledged" },
    { value: "dismissed", label: "Dismissed" },
    { value: "", label: "All alerts" },
];

export const ADMIN_TABS = [
    { key: "overview", label: "Overview", icon: "chart" },
    { key: "members", label: "Members", icon: "users" },
    { key: "teams", label: "Teams", icon: "shield" },
    { key: "alerts", label: "Alerts", icon: "bell" },
    { key: "reports", label: "Reports", icon: "download" },
    { key: "settings", label: "Settings", icon: "settings" },
    { key: "audit", label: "Audit log", icon: "clock" },
];

export const INVITATION_TTL_DAYS = 7;

export function roleLabel(role: string | null | undefined) {
    return role === "admin" || role === "business" || role === "individual"
        ? ROLE_LABELS[role]
        : role ?? "Individual";
}

export function formatDate(value: AdminDate) {
    if (!value)
        return "—";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export function formatDateTime(value: AdminDate) {
    if (!value)
        return "—";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function formatTime(value: AdminDate) {
    return value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
}

export function formatDuration(seconds = 0) {
    const total = Math.max(0, Math.floor(seconds));
    return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m`;
}

export function formatAction(action: string | null | undefined) {
    if (!action)
        return "Update";
    const [scope, verb] = action.split(".");
    const label = (verb ?? scope).replaceAll("_", " ");
    return label.charAt(0).toUpperCase() + label.slice(1);
}

export function buildInviteLink(token: string | null | undefined, email: string) {
    if (!token)
        return "";
    const link = new URL("/login", window.location.origin);
    link.searchParams.set("invite", token);
    link.searchParams.set("email", email);
    return link.toString();
}

export function errorMessage(cause: unknown, fallback: string) {
    return cause instanceof Error && cause.message ? cause.message : fallback;
}
