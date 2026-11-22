import { z } from "zod";
const email = z.string().trim().email().max(254);
const password = z.string().min(8).max(128);
export const signupSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email,
    password,
}).strict();
export const signinSchema = z.object({ email, password }).strict();
export const adminPasswordSigninSchema = z.object({ email, password }).strict();
export const operationsListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).max(1000).default(1),
    q: z.string().trim().max(120).optional(),
    role: z.enum(["employee", "manager", "admin"]).optional(),
}).strict();
export const operationsDateQuerySchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).default(() => new Date().toISOString().slice(0, 10)),
    page: z.coerce.number().int().min(1).max(1000).default(1),
}).strict();
export const operationsStatusSchema = z.object({ isActive: z.boolean() }).strict();
export const operationsTeamCreateSchema = z.object({
    organizationId: z.string().regex(/^[a-f\d]{24}$/i),
    name: z.string().trim().min(2).max(80),
}).strict();
export const operationsTeamAssignmentSchema = z.object({
    teamId: z.string().regex(/^[a-f\d]{24}$/i).nullable(),
}).strict();
export const invitationAcceptSchema = z.object({
    token: z.string().min(32).max(128),
    email,
    name: z.string().trim().min(2).max(100),
    password,
}).strict();
export const invitationCreateSchema = z.object({
    email,
    teamId: z.string().regex(/^[a-f\d]{24}$/i),
}).strict();
export const pulseSchema = z.object({
    mood: z.number().int().min(1).max(5),
    stress: z.number().int().min(1).max(5),
    workload: z.number().int().min(1).max(5),
    exhaustion: z.number().int().min(1).max(5),
    recovery: z.number().int().min(1).max(5),
    control: z.number().int().min(1).max(5),
    support: z.number().int().min(1).max(5),
}).strict();
export const createTeamSchema = z.object({ name: z.string().trim().min(2).max(80) }).strict();
export const updateMemberSchema = z.object({
    role: z.enum(["admin", "manager", "employee"]).optional(),
    teamId: z.string().regex(/^[a-f\d]{24}$/i).nullable().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one field");
export const startActivitySchema = z.object({
    task: z.string().trim().min(1).max(120),
    category: z.enum(["Productive", "Neutral", "Distracting"]),
    startedAt: z.string().datetime().optional(),
}).strict();
export const stopActivitySchema = z.object({}).strict().default({});
export const activityHeartbeatSchema = z.object({ sessionId: z.string().regex(/^[a-f\d]{24}$/i) }).strict();
export const idleActivitySchema = z.object({ idle: z.boolean() }).strict();
export const activityTagsSchema = z.object({
    tags: z.array(z.string().trim().min(1).max(32)).max(10),
    category: z.enum(["Productive", "Neutral", "Distracting"]).optional(),
    task: z.string().trim().min(1).max(120).optional(),
}).strict().refine((value) => value.tags.length > 0 || value.category !== undefined || value.task !== undefined, "Provide tags, category, or task");
export const historyQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
}).strict().refine((value) => !value.from || !value.to || new Date(value.from) <= new Date(value.to), "from must be earlier than to");
export const sessionSummaryQuerySchema = z.object({
    range: z.enum(["today", "7d", "30d", "quarter"]).default("30d"),
}).strict();
export const analyticsQuerySchema = z.object({
    weeks: z.coerce.number().int().min(1).max(26).default(6),
    teamId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
}).strict();
export const reportGenerateSchema = z.object({
    period: z.enum(["today", "7d", "30d", "quarter"]).default("30d"),
    metrics: z.array(z.enum(["Active time", "Productivity", "Idle time", "Burnout risk"])).min(1).max(4)
        .default(["Active time", "Productivity", "Burnout risk"]),
    format: z.enum(["csv", "pdf"]).default("pdf"),
}).strict();
export const reportPaymentOrderSchema = reportGenerateSchema;
export const paidReportGenerateSchema = reportGenerateSchema.extend({
    orderId: z.string().min(1).max(128),
    paymentId: z.string().min(1).max(128),
    signature: z.string().regex(/^[a-f\d]{64}$/i),
}).strict();
export const reportIdParamsSchema = z.object({ reportId: z.string().regex(/^[a-f\d]{24}$/i) }).strict();
export const profileSchema = z.object({
    name: z.string().trim().min(2).max(100).optional(),
    email: email.optional(),
    phone: z.string().trim().regex(/^\+[1-9]\d{7,14}$/).nullable().optional(),
    settings: z.object({
        idleThresholdMinutes: z.number().int().min(1).max(30).optional(),
        notifications: z.object({
            weeklyPulse: z.boolean().optional(),
            idlePrompt: z.boolean().optional(),
            productUpdates: z.boolean().optional(),
        }).strict().optional(),
    }).strict().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one field");
export const emailChangeVerificationSchema = z.object({ token: z.string().min(32).max(128) }).strict();
export const reportQuerySchema = z.object({
    period: z.enum(["today", "7d", "30d", "quarter"]).default("30d"),
    metrics: z.string().max(200).default("Active time,Productivity,Burnout risk")
        .transform((value) => value.split(",").filter(Boolean))
        .pipe(z.array(z.enum(["Active time", "Productivity", "Idle time", "Burnout risk"])).min(1).max(4)),
    format: z.enum(["csv", "pdf"]).optional(),
}).strict();
export const reportPreviewQuerySchema = reportQuerySchema;
export const reportFormatQuerySchema = z.object({ format: z.enum(["csv", "pdf"]) }).strict();
export const userRoleSchema = z.object({ role: z.enum(["admin", "manager", "employee"]) }).strict();
export const dashboardQuerySchema = z.object({ range: z.enum(["today", "7d", "30d"]).default("today") }).strict();
export const alertQuerySchema = z.object({ status: z.enum(["open", "acknowledged", "dismissed"]).optional() }).strict();
export const pulseTeamQuerySchema = z.object({ teamId: z.string().regex(/^[a-f\d]{24}$/i).optional() }).strict();
export const alertUpdateSchema = z.object({ status: z.enum(["acknowledged", "dismissed"]) }).strict();
export const checkoutSchema = z.object({
    plan: z.enum(["Starter", "Team", "Business"]),
    cycle: z.enum(["monthly", "yearly"]),
}).strict();
export const sessionIdParamsSchema = z.object({ sessionId: z.string().regex(/^[a-f\d]{24}$/i) }).strict();
export const alertIdParamsSchema = z.object({ alertId: z.string().regex(/^[a-f\d]{24}$/i) }).strict();
export const memberIdParamsSchema = z.object({ memberId: z.string().regex(/^[a-f\d]{24}$/i) }).strict();
export const userIdParamsSchema = z.object({ userId: z.string().regex(/^[a-f\d]{24}$/i) }).strict();
export const teamIdParamsSchema = z.object({ teamId: z.string().regex(/^[a-f\d]{24}$/i) }).strict();
export const businessIdParamsSchema = z.object({ businessId: z.string().regex(/^[a-f\d]{24}$/i) }).strict();
const objectId = z.string().regex(/^[a-f\d]{24}$/i);
export const adminListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).max(1000).default(1),
    q: z.string().trim().max(120).optional(),
    role: z.enum(["admin", "manager", "employee"]).optional(),
    status: z.enum(["active", "inactive"]).optional(),
}).strict();
export const adminInviteSchema = z.object({
    email,
    teamId: objectId,
    role: z.enum(["employee", "manager"]).default("employee"),
}).strict();
export const adminUserUpdateSchema = z.object({
    role: z.enum(["admin", "manager", "employee"]).optional(),
    teamId: objectId.nullable().optional(),
    isActive: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one field");
export const adminEmailParamsSchema = z.object({ email }).strict();
export const adminTeamSchema = z.object({ name: z.string().trim().min(2).max(80) }).strict();
export const adminAlertQuerySchema = z.object({
    status: z.enum(["open", "acknowledged", "dismissed"]).optional(),
    page: z.coerce.number().int().min(1).max(1000).default(1),
}).strict();
export const adminAlertUpdateSchema = z.object({ status: z.enum(["acknowledged", "dismissed"]) }).strict();
export const adminAuditQuerySchema = z.object({
    page: z.coerce.number().int().min(1).max(1000).default(1),
    action: z.string().trim().max(60).optional(),
}).strict();
export const adminReportQuerySchema = z.object({
    page: z.coerce.number().int().min(1).max(1000).default(1),
}).strict();
export const adminSettingsSchema = z.object({
    name: z.string().trim().min(2).max(120).optional(),
    minGroupSize: z.coerce.number().int().min(5).max(100).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one setting");
export const invitationIdParamsSchema = z.object({ invitationId: objectId }).strict();
export const forgotPasswordSchema = z.object({ email }).strict();
export const resetPasswordSchema = z.object({
    token: z.string().min(32).max(128),
    password,
}).strict();
export const otpRequestSchema = z.object({
    email: email.optional(),
    phone: z.string().trim().regex(/^\+[1-9]\d{7,14}$/).optional(),
    channel: z.enum(["email", "sms"]).default("email"),
    purpose: z.enum(["signin", "invitation"]),
    name: z.string().trim().min(2).max(100).optional(),
    invitationToken: z.string().min(32).max(128).optional(),
}).strict().superRefine((value, context) => {
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
export const otpVerifySchema = z.object({
    email: email.optional(),
    phone: z.string().trim().regex(/^\+[1-9]\d{7,14}$/).optional(),
    channel: z.enum(["email", "sms"]).default("email"),
    purpose: z.enum(["signin", "invitation"]),
    code: z.string().regex(/^\d{6}$/),
    name: z.string().trim().min(2).max(100).optional(),
}).strict().superRefine((value, context) => {
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
export const adminOtpRequestSchema = z.object({ email }).strict();
export const adminOtpVerifySchema = z.object({ email, code: z.string().regex(/^\d{6}$/) }).strict();
export const toolIdParamsSchema = z.object({ toolId: objectId }).strict();
export const plannerCreateSchema = z.object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().max(4000).optional(),
    estimatedMinutes: z.number().int().min(0).max(1440).optional(),
    dueAt: z.string().datetime().optional(),
}).strict();
export const plannerUpdateSchema = z.object({
    title: z.string().trim().min(1).max(160).optional(),
    description: z.string().trim().max(4000).optional(),
    estimatedMinutes: z.number().int().min(0).max(1440).optional(),
    dueAt: z.string().datetime().nullable().optional(),
    status: z.enum(["open", "completed"]).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one field");
export const leaveCreateSchema = z.object({
    leaveType: z.enum(["annual", "sick", "personal", "other"]),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    reason: z.string().trim().max(1000).optional(),
}).strict().refine((value) => new Date(value.startsAt) < new Date(value.endsAt), "Leave end must be after its start");
export const leaveDecisionSchema = z.object({ status: z.enum(["approved", "rejected"]) }).strict();
export const calendarEventSchema = z.object({
    kind: z.enum(["meeting", "reminder"]),
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().max(1000).optional(),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    reminderMinutes: z.number().int().min(0).max(10080).optional(),
}).strict().refine((value) => new Date(value.startsAt) < new Date(value.endsAt), "Event end must be after its start");