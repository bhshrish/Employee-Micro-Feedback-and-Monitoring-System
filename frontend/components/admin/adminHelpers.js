export const ROLE_LABELS = {
    admin: "Admin",
    manager: "Manager",
    employee: "Employee",
};

export const STATUS_FILTERS = [
    { value: "", label: "All accounts" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Deactivated" },
];

export const ROLE_FILTERS = [
    { value: "", label: "All roles" },
    { value: "admin", label: "Admins" },
    { value: "manager", label: "Managers" },
    { value: "employee", label: "Employees" },
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

export function roleLabel(role) {
    return ROLE_LABELS[role] ?? role ?? "Employee";
}

export function formatDate(value) {
    if (!value)
        return "—";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export function formatDateTime(value) {
    if (!value)
        return "—";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function formatAction(action) {
    if (!action)
        return "Update";
    const [scope, verb] = action.split(".");
    const label = (verb ?? scope).replaceAll("_", " ");
    return label.charAt(0).toUpperCase() + label.slice(1);
}

export function buildInviteLink(token, email) {
    if (!token)
        return "";
    const link = new URL("/login", window.location.origin);
    link.searchParams.set("invite", token);
    link.searchParams.set("email", email);
    return link.toString();
}

export function errorMessage(cause, fallback) {
    return cause instanceof Error && cause.message ? cause.message : fallback;
}
