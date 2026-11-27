"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSettingsSchema = exports.adminReportQuerySchema = exports.adminAuditQuerySchema = exports.adminAlertUpdateSchema = exports.adminAlertQuerySchema = exports.adminTeamSchema = exports.adminEmailParamsSchema = exports.adminUserUpdateSchema = exports.adminInviteSchema = exports.adminListQuerySchema = exports.businessIdParamsSchema = exports.teamIdParamsSchema = exports.userIdParamsSchema = exports.memberIdParamsSchema = exports.alertIdParamsSchema = exports.sessionIdParamsSchema = exports.checkoutSchema = exports.alertUpdateSchema = exports.pulseTeamQuerySchema = exports.alertQuerySchema = exports.dashboardQuerySchema = exports.userRoleSchema = exports.reportFormatQuerySchema = exports.reportPreviewQuerySchema = exports.reportQuerySchema = exports.emailChangeVerificationSchema = exports.profileSchema = exports.reportIdParamsSchema = exports.reportGenerateSchema = exports.analyticsQuerySchema = exports.sessionSummaryQuerySchema = exports.historyQuerySchema = exports.activityTagsSchema = exports.idleActivitySchema = exports.activityHeartbeatSchema = exports.stopActivitySchema = exports.startActivitySchema = exports.updateMemberSchema = exports.createTeamSchema = exports.pulseSchema = exports.invitationCreateSchema = exports.invitationAcceptSchema = exports.operationsTeamAssignmentSchema = exports.operationsTeamCreateSchema = exports.operationsStatusSchema = exports.operationsDateQuerySchema = exports.operationsListQuerySchema = exports.adminPasswordSigninSchema = exports.signinSchema = exports.signupSchema = void 0;
exports.calendarEventSchema = exports.leaveDecisionSchema = exports.leaveCreateSchema = exports.plannerUpdateSchema = exports.plannerCreateSchema = exports.toolIdParamsSchema = exports.adminOtpVerifySchema = exports.adminOtpRequestSchema = exports.otpVerifySchema = exports.otpRequestSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.invitationIdParamsSchema = void 0;
const zod_1 = require("zod");
const business_email_1 = require("./utils/business-email");
const email = zod_1.z.string().trim().email().max(254);
const password = zod_1.z.string().min(8).max(128);
exports.signupSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(100),
    email,
    password,
    accountType: zod_1.z.enum(["individual", "business"]).default("individual"),
    organizationName: zod_1.z.string().trim().min(2).max(120).optional(),
    organizationSize: zod_1.z.enum(["1-10", "11-50", "51-200", "201-500", "501+"]).optional(),
    industry: zod_1.z.string().trim().min(2).max(80).optional(),
}).strict().superRefine((value, context) => {
    if (value.accountType === "business" && !(0, business_email_1.isBusinessEmail)(value.email)) {
        context.addIssue({
            code: "custom",
            path: ["email"],
            message: "Business accounts must use a business email address. Gmail is accepted; Yahoo, Outlook, Hotmail, and similar providers are not.",
        });
    }
});
exports.signinSchema = zod_1.z.object({
    email,
    password,
    accountType: zod_1.z.enum(["individual", "business"]).optional(),
}).strict();
exports.adminPasswordSigninSchema = zod_1.z.object({ email, password }).strict();
exports.operationsListQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).max(1000).default(1),
    q: zod_1.z.string().trim().max(120).optional(),
    role: zod_1.z.enum(["individual", "business", "admin"]).optional(),
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
exports.invitationAcceptSchema = zod_1.z.object({
    token: zod_1.z.string().min(32).max(128),
    email,
    name: zod_1.z.string().trim().min(2).max(100),
    password,
}).strict();
exports.invitationCreateSchema = zod_1.z.object({
    email,
    teamId: zod_1.z.string().regex(/^[a-f\d]{24}$/i),
}).strict();
exports.pulseSchema = zod_1.z.object({
    mood: zod_1.z.number().int().min(1).max(5),
    stress: zod_1.z.number().int().min(1).max(5),
    workload: zod_1.z.number().int().min(1).max(5),
    exhaustion: zod_1.z.number().int().min(1).max(5),
    recovery: zod_1.z.number().int().min(1).max(5),
    control: zod_1.z.number().int().min(1).max(5),
    support: zod_1.z.number().int().min(1).max(5),
}).strict();
exports.createTeamSchema = zod_1.z.object({ name: zod_1.z.string().trim().min(2).max(80) }).strict();
exports.updateMemberSchema = zod_1.z.object({
    role: zod_1.z.enum(["individual", "business"]).optional(),
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
    metrics: zod_1.z.array(zod_1.z.enum(["Active time", "Productivity", "Idle time", "Burnout risk"])).min(1).max(4)
        .default(["Active time", "Productivity", "Burnout risk"]),
    format: zod_1.z.enum(["csv", "pdf"]).default("pdf"),
}).strict();
exports.reportIdParamsSchema = zod_1.z.object({ reportId: zod_1.z.string().regex(/^[a-f\d]{24}$/i) }).strict();
exports.profileSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(100).optional(),
    email: email.optional(),
    phone: zod_1.z.string().trim().regex(/^\+[1-9]\d{7,14}$/).nullable().optional(),
    settings: zod_1.z.object({
        idleThresholdMinutes: zod_1.z.number().int().min(1).max(30).optional(),
        notifications: zod_1.z.object({
            weeklyPulse: zod_1.z.boolean().optional(),
            idlePrompt: zod_1.z.boolean().optional(),
            productUpdates: zod_1.z.boolean().optional(),
        }).strict().optional(),
    }).strict().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one field");
exports.emailChangeVerificationSchema = zod_1.z.object({ token: zod_1.z.string().min(32).max(128) }).strict();
exports.reportQuerySchema = zod_1.z.object({
    period: zod_1.z.enum(["today", "7d", "30d", "quarter"]).default("30d"),
    metrics: zod_1.z.string().max(200).default("Active time,Productivity,Burnout risk")
        .transform((value) => value.split(",").filter(Boolean))
        .pipe(zod_1.z.array(zod_1.z.enum(["Active time", "Productivity", "Idle time", "Burnout risk"])).min(1).max(4)),
    format: zod_1.z.enum(["csv", "pdf"]).optional(),
}).strict();
exports.reportPreviewQuerySchema = exports.reportQuerySchema;
exports.reportFormatQuerySchema = zod_1.z.object({ format: zod_1.z.enum(["csv", "pdf"]) }).strict();
exports.userRoleSchema = zod_1.z.object({ role: zod_1.z.enum(["individual", "business"]) }).strict();
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
exports.businessIdParamsSchema = zod_1.z.object({ businessId: zod_1.z.string().regex(/^[a-f\d]{24}$/i) }).strict();
const objectId = zod_1.z.string().regex(/^[a-f\d]{24}$/i);
exports.adminListQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).max(1000).default(1),
    q: zod_1.z.string().trim().max(120).optional(),
    role: zod_1.z.enum(["individual", "business"]).optional(),
    status: zod_1.z.enum(["active", "inactive"]).optional(),
}).strict();
exports.adminInviteSchema = zod_1.z.object({
    email,
    teamId: objectId,
    role: zod_1.z.literal("individual").default("individual"),
}).strict();
exports.adminUserUpdateSchema = zod_1.z.object({
    role: zod_1.z.enum(["individual", "business"]).optional(),
    teamId: objectId.nullable().optional(),
    isActive: zod_1.z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one field");
exports.adminEmailParamsSchema = zod_1.z.object({ email }).strict();
exports.adminTeamSchema = zod_1.z.object({ name: zod_1.z.string().trim().min(2).max(80) }).strict();
exports.adminAlertQuerySchema = zod_1.z.object({
    status: zod_1.z.enum(["open", "acknowledged", "dismissed"]).optional(),
    page: zod_1.z.coerce.number().int().min(1).max(1000).default(1),
}).strict();
exports.adminAlertUpdateSchema = zod_1.z.object({ status: zod_1.z.enum(["acknowledged", "dismissed"]) }).strict();
exports.adminAuditQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).max(1000).default(1),
    action: zod_1.z.string().trim().max(60).optional(),
}).strict();
exports.adminReportQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).max(1000).default(1),
}).strict();
exports.adminSettingsSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(120).optional(),
    minGroupSize: zod_1.z.coerce.number().int().min(5).max(100).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one setting");
exports.invitationIdParamsSchema = zod_1.z.object({ invitationId: objectId }).strict();
exports.forgotPasswordSchema = zod_1.z.object({ email }).strict();
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(32).max(128),
    password,
}).strict();
exports.otpRequestSchema = zod_1.z.object({
    email: email.optional(),
    phone: zod_1.z.string().trim().regex(/^\+[1-9]\d{7,14}$/).optional(),
    channel: zod_1.z.enum(["email", "sms"]).default("email"),
    purpose: zod_1.z.enum(["signin", "invitation"]),
    accountType: zod_1.z.enum(["individual", "business"]).optional(),
    name: zod_1.z.string().trim().min(2).max(100).optional(),
    invitationToken: zod_1.z.string().min(32).max(128).optional(),
}).strict().superRefine((value, context) => {
    if (value.accountType && value.purpose !== "signin") {
        context.addIssue({ code: "custom", message: "Account type is only available for sign-in" });
    }
    if (value.channel === "email" && !value.email) {
        context.addIssue({ code: "custom", message: "Email is required for email verification" });
    }
    if (value.channel === "sms" && !value.phone) {
        context.addIssue({ code: "custom", message: "Phone is required for SMS verification" });
    }
    if (value.purpose !== "signin" && value.channel !== "email") {
        context.addIssue({ code: "custom", message: "Registration and invitations require email verification" });
    }
    if (value.purpose === "invitation" && !value.invitationToken) {
        context.addIssue({ code: "custom", message: "An invitation token is required" });
    }
});
exports.otpVerifySchema = zod_1.z.object({
    email: email.optional(),
    phone: zod_1.z.string().trim().regex(/^\+[1-9]\d{7,14}$/).optional(),
    channel: zod_1.z.enum(["email", "sms"]).default("email"),
    purpose: zod_1.z.enum(["signin", "invitation"]),
    accountType: zod_1.z.enum(["individual", "business"]).optional(),
    code: zod_1.z.string().regex(/^\d{6}$/),
    name: zod_1.z.string().trim().min(2).max(100).optional(),
}).strict().superRefine((value, context) => {
    if (value.accountType && value.purpose !== "signin") {
        context.addIssue({ code: "custom", message: "Account type is only available for sign-in" });
    }
    if (value.channel === "email" && !value.email) {
        context.addIssue({ code: "custom", message: "Email is required for email verification" });
    }
    if (value.channel === "sms" && !value.phone) {
        context.addIssue({ code: "custom", message: "Phone is required for SMS verification" });
    }
    if (value.purpose !== "signin" && value.channel !== "email") {
        context.addIssue({ code: "custom", message: "Registration and invitations require email verification" });
    }
    if (value.purpose === "invitation" && !value.name) {
        context.addIssue({ code: "custom", message: "Name is required to accept an invitation" });
    }
});
exports.adminOtpRequestSchema = zod_1.z.object({ email }).strict();
exports.adminOtpVerifySchema = zod_1.z.object({ email, code: zod_1.z.string().regex(/^\d{6}$/) }).strict();
exports.toolIdParamsSchema = zod_1.z.object({ toolId: objectId }).strict();
exports.plannerCreateSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1).max(160),
    description: zod_1.z.string().trim().max(4000).optional(),
    estimatedMinutes: zod_1.z.number().int().min(0).max(1440).optional(),
    dueAt: zod_1.z.string().datetime().optional(),
}).strict();
exports.plannerUpdateSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1).max(160).optional(),
    description: zod_1.z.string().trim().max(4000).optional(),
    estimatedMinutes: zod_1.z.number().int().min(0).max(1440).optional(),
    dueAt: zod_1.z.string().datetime().nullable().optional(),
    status: zod_1.z.enum(["open", "completed"]).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one field");
exports.leaveCreateSchema = zod_1.z.object({
    leaveType: zod_1.z.enum(["annual", "sick", "personal", "other"]),
    startsAt: zod_1.z.string().datetime(),
    endsAt: zod_1.z.string().datetime(),
    reason: zod_1.z.string().trim().max(1000).optional(),
}).strict().refine((value) => new Date(value.startsAt) < new Date(value.endsAt), "Leave end must be after its start");
exports.leaveDecisionSchema = zod_1.z.object({ status: zod_1.z.enum(["approved", "rejected"]) }).strict();
exports.calendarEventSchema = zod_1.z.object({
    kind: zod_1.z.enum(["meeting", "reminder"]),
    title: zod_1.z.string().trim().min(1).max(160),
    description: zod_1.z.string().trim().max(1000).optional(),
    startsAt: zod_1.z.string().datetime(),
    endsAt: zod_1.z.string().datetime(),
    reminderMinutes: zod_1.z.number().int().min(0).max(10080).optional(),
}).strict().refine((value) => new Date(value.startsAt) < new Date(value.endsAt), "Event end must be after its start");
