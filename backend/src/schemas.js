"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.operationsTeamAssignmentSchema = exports.operationsTeamCreateSchema = exports.operationsStatusSchema = exports.operationsListQuerySchema = exports.operationsDateQuerySchema = exports.businessIdParamsSchema = exports.teamIdParamsSchema = exports.userIdParamsSchema = exports.memberIdParamsSchema = exports.alertIdParamsSchema = exports.sessionIdParamsSchema = exports.checkoutSchema = exports.alertUpdateSchema = exports.pulseTeamQuerySchema = exports.alertQuerySchema = exports.dashboardQuerySchema = exports.userRoleSchema = exports.reportFormatQuerySchema = exports.reportPreviewQuerySchema = exports.reportQuerySchema = exports.profileSchema = exports.reportIdParamsSchema = exports.reportGenerateSchema = exports.analyticsQuerySchema = exports.sessionSummaryQuerySchema = exports.historyQuerySchema = exports.activityTagsSchema = exports.idleActivitySchema = exports.activityHeartbeatSchema = exports.stopActivitySchema = exports.startActivitySchema = exports.updateMemberSchema = exports.createTeamSchema = exports.pulseSchema = exports.invitationCreateSchema = exports.invitationAcceptSchema = exports.signinSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
const email = zod_1.z.string().trim().email().max(254);
const password = zod_1.z.string().min(8).max(128);
exports.signupSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(100),
    email,
    password,
    organizationName: zod_1.z.string().trim().min(2).max(120).optional(),
    termsAccepted: zod_1.z.boolean().optional(),
}).strict()
    .refine((value) => value.termsAccepted !== false, {
        message: "Terms must be accepted",
        path: ["termsAccepted"],
    })
    .refine((value) => !value.termsAccepted || (/[a-z]/.test(value.password) && /[A-Z]/.test(value.password) && /\d/.test(value.password)), {
        message: "Password must include uppercase, lowercase, and number characters",
        path: ["password"],
    });
exports.signinSchema = zod_1.z.object({ email, password, rememberMe: zod_1.z.boolean().optional() }).strict();
exports.forgotPasswordSchema = zod_1.z.object({ email }).strict();
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(32).max(128),
    password: zod_1.z.string().min(8).max(128)
        .regex(/[a-z]/, "Password must include a lowercase letter")
        .regex(/[A-Z]/, "Password must include an uppercase letter")
        .regex(/\d/, "Password must include a number"),
}).strict();
exports.operationsSigninSchema = zod_1.z.object({
    username: zod_1.z.string().min(1).max(64),
    email,
    password: zod_1.z.string().min(1).max(128),
}).strict();
exports.operationsListQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).max(1000).default(1),
    q: zod_1.z.string().trim().max(120).optional(),
    role: zod_1.z.enum(["employee", "manager", "admin"]).optional(),
}).strict();
exports.operationsDateQuerySchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).default(() => new Date().toISOString().slice(0, 10)),
    page: zod_1.z.coerce.number().int().min(1).max(1000).default(1),
}).strict();
exports.operationsStatusSchema = zod_1.z.object({ isActive: zod_1.z.boolean() }).strict();
exports.operationsTeamCreateSchema = zod_1.z.object({
    organizationId: zod_1.z.string().regex(/^[a-f\d]{24}$/i),
    name: zod_1.z.string().trim().min(2).max(80),
}).strict();
exports.operationsTeamAssignmentSchema = zod_1.z.object({
    teamId: zod_1.z.string().regex(/^[a-f\d]{24}$/i).nullable(),
}).strict();
const invitationAcceptBaseSchema = zod_1.z.object({
    token: zod_1.z.string().min(32).max(128),
    email,
    name: zod_1.z.string().trim().min(2).max(100),
    password,
}).strict();
exports.invitationAcceptSchema = invitationAcceptBaseSchema;
exports.strictInvitationAcceptSchema = invitationAcceptBaseSchema.extend({
    password: zod_1.z.string().min(8).max(128)
        .regex(/[a-z]/, "Password must include a lowercase letter")
        .regex(/[A-Z]/, "Password must include an uppercase letter")
        .regex(/\d/, "Password must include a number"),
});
exports.invitationCreateSchema = zod_1.z.object({
    email,
    teamId: zod_1.z.string().regex(/^[a-f\d]{24}$/i),
    role: zod_1.z.enum(["manager", "employee"]).optional(),
}).strict();
exports.pulseSchema = zod_1.z.object({
    mood: zod_1.z.number().int().min(1).max(5),
    stress: zod_1.z.number().int().min(1).max(5),
    workload: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().max(300).optional(),
}).strict();
exports.createTeamSchema = zod_1.z.object({ name: zod_1.z.string().trim().min(2).max(80) }).strict();
exports.updateMemberSchema = zod_1.z.object({
    role: zod_1.z.enum(["admin", "manager", "employee"]).optional(),
    teamId: zod_1.z.string().regex(/^[a-f\d]{24}$/i).nullable().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one field");
exports.startActivitySchema = zod_1.z.object({
    task: zod_1.z.string().trim().min(1).max(120),
    category: zod_1.z.enum(["Productive", "Neutral", "Distracting"]),
    startedAt: zod_1.z.string().datetime().optional(),
}).strict();
exports.stopActivitySchema = zod_1.z.object({}).strict().default({});
exports.activityHeartbeatSchema = zod_1.z.object({ sessionId: zod_1.z.string().regex(/^[a-f\d]{24}$/i) }).strict();
exports.idleActivitySchema = zod_1.z.object({ idle: zod_1.z.boolean() }).strict();
exports.activityTagsSchema = zod_1.z.object({
    tags: zod_1.z.array(zod_1.z.string().trim().min(1).max(32)).max(10),
    category: zod_1.z.enum(["Productive", "Neutral", "Distracting"]).optional(),
    task: zod_1.z.string().trim().min(1).max(120).optional(),
}).strict().refine((value) => value.tags.length > 0 || value.category !== undefined || value.task !== undefined, "Provide tags, category, or task");
exports.historyQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(25),
    from: zod_1.z.string().datetime().optional(),
    to: zod_1.z.string().datetime().optional(),
}).strict().refine((value) => !value.from || !value.to || new Date(value.from) <= new Date(value.to), "from must be earlier than to");
exports.sessionSummaryQuerySchema = zod_1.z.object({
    range: zod_1.z.enum(["today", "7d", "30d", "quarter"]).default("30d"),
}).strict();
exports.analyticsQuerySchema = zod_1.z.object({
    weeks: zod_1.z.coerce.number().int().min(1).max(26).default(6),
    teamId: zod_1.z.string().regex(/^[a-f\d]{24}$/i).optional(),
}).strict();
exports.reportGenerateSchema = zod_1.z.object({
    period: zod_1.z.enum(["today", "7d", "30d", "quarter"]).default("30d"),
    metrics: zod_1.z.array(zod_1.z.enum(["Active time", "Productivity", "Idle time", "Team pulse", "Burnout risk"])).min(1).max(5)
        .default(["Active time", "Productivity", "Team pulse"]),
    format: zod_1.z.enum(["csv", "pdf"]).default("pdf"),
}).strict();
exports.reportIdParamsSchema = zod_1.z.object({ reportId: zod_1.z.string().regex(/^[a-f\d]{24}$/i) }).strict();
exports.profileSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(100).optional(),
    settings: zod_1.z.object({
        idleThresholdMinutes: zod_1.z.number().int().min(1).max(30).optional(),
        notifications: zod_1.z.object({
            weeklyPulse: zod_1.z.boolean().optional(),
            idlePrompt: zod_1.z.boolean().optional(),
            productUpdates: zod_1.z.boolean().optional(),
        }).strict().optional(),
    }).strict().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one field");
exports.reportQuerySchema = zod_1.z.object({
    period: zod_1.z.enum(["today", "7d", "30d", "quarter"]).default("30d"),
    metrics: zod_1.z.string().max(200).default("Active time,Productivity,Team pulse")
        .transform((value) => value.split(",").filter(Boolean))
        .pipe(zod_1.z.array(zod_1.z.enum(["Active time", "Productivity", "Idle time", "Team pulse", "Burnout risk"])).min(1).max(5)),
    format: zod_1.z.enum(["csv", "pdf"]).optional(),
}).strict();
exports.reportPreviewQuerySchema = exports.reportQuerySchema;
exports.reportFormatQuerySchema = zod_1.z.object({ format: zod_1.z.enum(["csv", "pdf"]) }).strict();
exports.userRoleSchema = zod_1.z.object({ role: zod_1.z.enum(["admin", "manager", "employee"]) }).strict();
exports.dashboardQuerySchema = zod_1.z.object({ range: zod_1.z.enum(["today", "7d", "30d"]).default("today") }).strict();
exports.alertQuerySchema = zod_1.z.object({ status: zod_1.z.enum(["open", "acknowledged", "dismissed"]).optional() }).strict();
exports.pulseTeamQuerySchema = zod_1.z.object({ teamId: zod_1.z.string().regex(/^[a-f\d]{24}$/i).optional() }).strict();
exports.alertUpdateSchema = zod_1.z.object({ status: zod_1.z.enum(["acknowledged", "dismissed"]) }).strict();
exports.checkoutSchema = zod_1.z.object({
    plan: zod_1.z.enum(["Starter", "Team", "Business"]),
    cycle: zod_1.z.enum(["monthly", "yearly"]),
}).strict();
exports.sessionIdParamsSchema = zod_1.z.object({ sessionId: zod_1.z.string().regex(/^[a-f\d]{24}$/i) }).strict();
exports.alertIdParamsSchema = zod_1.z.object({ alertId: zod_1.z.string().regex(/^[a-f\d]{24}$/i) }).strict();
exports.memberIdParamsSchema = zod_1.z.object({ memberId: zod_1.z.string().regex(/^[a-f\d]{24}$/i) }).strict();
exports.userIdParamsSchema = zod_1.z.object({ userId: zod_1.z.string().regex(/^[a-f\d]{24}$/i) }).strict();
exports.teamIdParamsSchema = zod_1.z.object({ teamId: zod_1.z.string().regex(/^[a-f\d]{24}$/i) }).strict();
exports.adminListQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).max(1000).default(1),
    q: zod_1.z.string().trim().max(120).optional(),
    role: zod_1.z.enum(["employee", "manager", "admin"]).optional(),
    teamId: zod_1.z.string().regex(/^[a-f\d]{24}$/i).optional(),
    status: zod_1.z.enum(["active", "inactive", "pending_invite"]).optional(),
}).strict();
exports.adminInviteSchema = zod_1.z.object({
    email,
    teamId: zod_1.z.string().regex(/^[a-f\d]{24}$/i),
    role: zod_1.z.enum(["manager", "employee"]),
}).strict();
exports.adminUserUpdateSchema = zod_1.z.object({
    role: zod_1.z.enum(["admin", "manager", "employee"]).optional(),
    teamId: zod_1.z.string().regex(/^[a-f\d]{24}$/i).nullable().optional(),
    isActive: zod_1.z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one field");
exports.adminTeamSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(80).optional(),
    managerId: zod_1.z.string().regex(/^[a-f\d]{24}$/i).nullable().optional(),
    memberIds: zod_1.z.array(zod_1.z.string().regex(/^[a-f\d]{24}$/i)).max(1000).optional(),
}).strict();
exports.pulseQuestionSchema = zod_1.z.object({
    prompt: zod_1.z.string().trim().min(3).max(240).optional(),
    type: zod_1.z.enum(["scale", "yes_no", "short_text"]).optional(),
    required: zod_1.z.boolean().optional(),
    active: zod_1.z.boolean().optional(),
    frequency: zod_1.z.enum(["weekly", "monthly"]).optional(),
    scheduleDay: zod_1.z.number().int().min(0).max(6).optional(),
    order: zod_1.z.number().int().min(0).max(1000).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one field");
exports.alertRulesSchema = zod_1.z.object({
    moraleBelow: zod_1.z.number().min(1).max(5),
    consecutiveWeeks: zod_1.z.number().int().min(1).max(12),
    suddenDropPercent: zod_1.z.number().min(1).max(100),
    emailEnabled: zod_1.z.boolean(),
    inAppEnabled: zod_1.z.boolean(),
}).strict();
exports.adminAlertQuerySchema = zod_1.z.object({
    status: zod_1.z.enum(["open", "acknowledged", "resolved", "dismissed"]).optional(),
}).strict();
exports.adminAlertUpdateSchema = zod_1.z.object({
    status: zod_1.z.enum(["acknowledged", "resolved"]),
}).strict();
exports.adminReportQuerySchema = zod_1.z.object({
    period: zod_1.z.enum(["7d", "30d", "quarter"]).default("7d"),
    format: zod_1.z.enum(["csv", "pdf"]).optional(),
}).strict();
exports.adminAuditQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).max(1000).default(1),
}).strict();
exports.adminEmailParamsSchema = zod_1.z.object({ email: email }).strict();
exports.adminSettingsSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(120).optional(),
    dataRetentionDays: zod_1.z.number().int().min(30).max(3650).optional(),
    minGroupSize: zod_1.z.number().int().min(5).max(100).optional(),
    pulseReminderEnabled: zod_1.z.boolean().optional(),
    pulseReminderDay: zod_1.z.number().int().min(0).max(6).optional(),
    pulseReminderHour: zod_1.z.number().int().min(0).max(23).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one field");
exports.businessIdParamsSchema = zod_1.z.object({ businessId: zod_1.z.string().regex(/^[a-f\d]{24}$/i) }).strict();
