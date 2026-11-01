import { z } from "zod";

const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const password = z.string().min(8).max(128);

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email,
  password,
  organizationName: z.string().trim().min(2).max(120).optional(),
}).strict();
export const signinSchema = z.object({ email, password }).strict();
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
  comment: z.string().max(300).optional(),
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
}).strict().refine((value) => value.tags.length > 0 || value.category !== undefined, "Provide tags or category");
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
  metrics: z.array(z.enum(["Active time", "Productivity", "Idle time", "Team pulse", "Burnout risk"])).min(1).max(5)
    .default(["Active time", "Productivity", "Team pulse"]),
  format: z.enum(["csv", "pdf"]).default("pdf"),
}).strict();
export const reportIdParamsSchema = z.object({ reportId: z.string().regex(/^[a-f\d]{24}$/i) }).strict();
export const profileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  settings: z.object({
    idleThresholdMinutes: z.number().int().min(1).max(30).optional(),
    notifications: z.object({
      weeklyPulse: z.boolean().optional(),
      idlePrompt: z.boolean().optional(),
      productUpdates: z.boolean().optional(),
    }).strict().optional(),
  }).strict().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one field");
export const reportQuerySchema = z.object({
  period: z.enum(["today", "7d", "30d", "quarter"]).default("30d"),
  metrics: z.string().max(200).default("Active time,Productivity,Team pulse")
    .transform((value) => value.split(",").filter(Boolean))
    .pipe(z.array(z.enum(["Active time", "Productivity", "Idle time", "Team pulse", "Burnout risk"])).min(1).max(5)),
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
