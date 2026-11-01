import { Router } from "express";
import mongoose from "mongoose";
import * as authController from "../controllers/auth.controller";
import * as activityController from "../controllers/activity.controller";
import * as analyticsController from "../controllers/analytics.controller";
import * as billingController from "../controllers/billing.controller";
import * as pulseController from "../controllers/pulse.controller";
import * as reportController from "../controllers/report.controller";
import * as workspaceController from "../controllers/workspace.controller";
import { authenticate, requireEntitlement, requirePlan, requireRole } from "../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import {
  alertIdParamsSchema, alertQuerySchema, alertUpdateSchema, checkoutSchema, createTeamSchema, dashboardQuerySchema,
  activityHeartbeatSchema, activityTagsSchema, analyticsQuerySchema, historyQuerySchema, idleActivitySchema, invitationAcceptSchema, invitationCreateSchema,
  memberIdParamsSchema, profileSchema, pulseSchema, pulseTeamQuerySchema, reportGenerateSchema, reportIdParamsSchema,
  reportQuerySchema, sessionIdParamsSchema, sessionSummaryQuerySchema, signinSchema, signupSchema, startActivitySchema,
  stopActivitySchema, teamIdParamsSchema, updateMemberSchema, userIdParamsSchema, reportFormatQuerySchema,
  userRoleSchema,
} from "../schemas";
import { Alert } from "../models/Alert";
import { Organization } from "../models/Organization";
import { notFound, unauthorized } from "../utils/errors";
import { asyncHandler } from "../utils/async-handler";

const api = Router();
const teamFeature = requirePlan("Team", "Business");
const activeWorkspace = requireEntitlement;

const authRoutes = Router();
authRoutes.post("/signup", validateBody(signupSchema), authController.signup);
authRoutes.post("/signin", validateBody(signinSchema), authController.signin);
authRoutes.post("/login", validateBody(signinSchema), authController.signin);
authRoutes.post("/accept-invitation", validateBody(invitationAcceptSchema), authController.acceptInvitation);
authRoutes.post("/refresh", authController.refresh);
authRoutes.post("/logout", authController.logout);
authRoutes.post("/logout-all", authenticate, authController.logoutEverywhere);
authRoutes.get("/me", authenticate, authController.me);
authRoutes.patch("/me", authenticate, validateBody(profileSchema), authController.updateProfile);
api.use("/auth", authRoutes);

api.get("/health/live", (_req, res) => res.json({ status: "ok" }));
api.get("/health/ready", (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ status: "not_ready", dependencies: { mongodb: "unavailable" } });
    return;
  }
  res.json({ status: "ready", dependencies: { mongodb: "ok" } });
});
api.get("/health", (_req, res) => res.json({ status: "ok" }));

const workspaceRoutes = Router();
workspaceRoutes.use(authenticate, activeWorkspace);
workspaceRoutes.get("/teams", workspaceController.teams);
workspaceRoutes.post("/teams", requireRole("admin"), validateBody(createTeamSchema), workspaceController.createTeam);
workspaceRoutes.post("/invitations", requireRole("admin", "manager"), validateBody(invitationCreateSchema), workspaceController.inviteMember);
workspaceRoutes.delete("/teams/:teamId", requireRole("admin"), validateParams(teamIdParamsSchema), workspaceController.archiveTeam);
workspaceRoutes.get("/members", requireRole("admin", "manager"), workspaceController.members);
workspaceRoutes.patch("/members/:memberId", requireRole("admin"), validateParams(memberIdParamsSchema), validateBody(updateMemberSchema), workspaceController.updateMember);
workspaceRoutes.get("/organization", asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const organization = await Organization.findById(req.auth.organizationId).select("name createdAt").lean();
  if (!organization) throw notFound("Workspace not found");
  res.json({ organization });
}));
api.use("/workspace", workspaceRoutes);

const usersRoutes = Router();
usersRoutes.use(authenticate, activeWorkspace);
usersRoutes.get("/me", authController.me);
usersRoutes.patch("/me", validateBody(profileSchema), authController.updateProfile);
usersRoutes.get("/", requireRole("admin", "manager"), workspaceController.members);
usersRoutes.post("/", requireRole("admin", "manager"), validateBody(invitationCreateSchema), workspaceController.inviteMember);
usersRoutes.post("/invite", requireRole("admin"), validateBody(invitationCreateSchema), workspaceController.inviteMember);
usersRoutes.patch("/:userId", requireRole("admin"), validateParams(userIdParamsSchema), validateBody(updateMemberSchema), workspaceController.updateMember);
usersRoutes.patch("/:userId/role", requireRole("admin"), validateParams(userIdParamsSchema), validateBody(userRoleSchema), workspaceController.updateMember);
api.use("/users", usersRoutes);

const activityRoutes = Router();
activityRoutes.get("/sessions", authenticate, activeWorkspace, validateQuery(historyQuerySchema), activityController.history);
activityRoutes.get("/dashboard", authenticate, activeWorkspace, validateQuery(dashboardQuerySchema), activityController.dashboard);
activityRoutes.post("/sessions", authenticate, activeWorkspace, validateBody(startActivitySchema), activityController.start);
activityRoutes.post("/sessions/start", authenticate, activeWorkspace, validateBody(startActivitySchema), activityController.start);
activityRoutes.post("/sessions/:sessionId/heartbeat", authenticate, activeWorkspace, validateParams(sessionIdParamsSchema), activityController.heartbeat);
activityRoutes.post("/sessions/heartbeat", authenticate, activeWorkspace, validateBody(activityHeartbeatSchema), activityController.heartbeat);
activityRoutes.post("/sessions/:sessionId/idle", authenticate, activeWorkspace, validateParams(sessionIdParamsSchema), validateBody(idleActivitySchema), activityController.idle);
activityRoutes.patch("/sessions/:sessionId/tags", authenticate, activeWorkspace, validateParams(sessionIdParamsSchema), validateBody(activityTagsSchema), activityController.tags);
activityRoutes.post("/sessions/:sessionId/tags", authenticate, activeWorkspace, validateParams(sessionIdParamsSchema), validateBody(activityTagsSchema), activityController.tags);
activityRoutes.get("/sessions/history", authenticate, activeWorkspace, validateQuery(historyQuerySchema), activityController.history);
activityRoutes.get("/sessions/summary", authenticate, activeWorkspace, validateQuery(sessionSummaryQuerySchema), activityController.summary);
activityRoutes.post("/sessions/:sessionId/pause", authenticate, activeWorkspace, validateParams(sessionIdParamsSchema), activityController.pause);
activityRoutes.post("/sessions/:sessionId/resume", authenticate, activeWorkspace, validateParams(sessionIdParamsSchema), activityController.resume);
activityRoutes.post("/sessions/:sessionId/stop", authenticate, activeWorkspace, validateParams(sessionIdParamsSchema), validateBody(stopActivitySchema), activityController.stop);
api.use(activityRoutes);

const pulseRoutes = Router();
pulseRoutes.post("/pulse", authenticate, activeWorkspace, validateBody(pulseSchema), pulseController.submit);
pulseRoutes.get("/pulse/me", authenticate, activeWorkspace, pulseController.submissionStatus);
pulseRoutes.post("/pulses", authenticate, activeWorkspace, validateBody(pulseSchema), pulseController.submit);
pulseRoutes.get("/pulses/status", authenticate, activeWorkspace, pulseController.submissionStatus);
pulseRoutes.get("/pulse/teams", authenticate, activeWorkspace, teamFeature, requireRole("admin", "manager"), validateQuery(pulseTeamQuerySchema), pulseController.teamScores);
pulseRoutes.get("/alerts", authenticate, activeWorkspace, teamFeature, requireRole("admin", "manager"), validateQuery(alertQuerySchema), pulseController.alerts);
pulseRoutes.patch("/alerts/:alertId", authenticate, activeWorkspace, teamFeature, requireRole("admin", "manager"), validateParams(alertIdParamsSchema), validateBody(alertUpdateSchema), pulseController.updateAlert);
api.use(pulseRoutes);

const analyticsRoutes = Router();
analyticsRoutes.use(authenticate, activeWorkspace, teamFeature, requireRole("admin", "manager"));
analyticsRoutes.get("/trends", validateQuery(analyticsQuerySchema), analyticsController.trends);
analyticsRoutes.get("/heatmap", validateQuery(analyticsQuerySchema), analyticsController.heatmap);
analyticsRoutes.get("/teams", analyticsController.teams);
analyticsRoutes.get("/teams/:teamId/trend", validateParams(teamIdParamsSchema), validateQuery(analyticsQuerySchema), analyticsController.teamTrend);
api.use("/analytics", analyticsRoutes);

const reportRoutes = Router();
reportRoutes.use(authenticate);
reportRoutes.get("/preview", requireRole("admin", "manager"), validateQuery(reportQuerySchema), reportController.preview);
reportRoutes.post("/preview", requireRole("admin", "manager"), validateBody(reportGenerateSchema), reportController.previewPost);
reportRoutes.get("/summary", requireRole("admin", "manager"), validateQuery(reportQuerySchema), reportController.summary);
reportRoutes.get("/export", requireRole("admin", "manager"), validateQuery(reportQuerySchema), reportController.download);
reportRoutes.post("/generate", requireRole("admin", "manager"), validateBody(reportGenerateSchema), reportController.generate);
reportRoutes.get("/:reportId/download", requireRole("admin", "manager"), validateParams(reportIdParamsSchema), validateQuery(reportFormatQuerySchema), reportController.downloadGenerated);
reportRoutes.get("/:reportId", requireRole("admin", "manager"), validateParams(reportIdParamsSchema), reportController.downloadGenerated);
api.use("/reports", reportRoutes);

const billingRoutes = Router();
billingRoutes.get("/plans", billingController.availablePlans);
billingRoutes.use(authenticate);
billingRoutes.post("/checkout", requireRole("admin"), validateBody(checkoutSchema), billingController.checkout);
billingRoutes.post("/checkout-session", requireRole("admin"), validateBody(checkoutSchema), billingController.checkout);
billingRoutes.post("/cancel", requireRole("admin"), billingController.cancel);
billingRoutes.get("/invoices", requireRole("admin"), billingController.listInvoices);
billingRoutes.get("/subscription", billingController.currentSubscription);
billingRoutes.post("/portal-session", requireRole("admin"), billingController.portalSession);
billingRoutes.post("/subscription/portal-session", requireRole("admin"), billingController.portalSession);
api.use("/billing", billingRoutes);

api.get("/alerts/:alertId", authenticate, activeWorkspace, teamFeature, requireRole("admin", "manager"), validateParams(alertIdParamsSchema), asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const alert = await Alert.findOne({
    _id: req.params.alertId,
    organizationId: req.auth.organizationId,
    ...(req.auth.role === "admin" ? {} : { teamId: req.auth.teamId }),
  }).populate("teamId", "name").lean();
  if (!alert) throw notFound("Alert not found");
  res.json({ alert });
}));

export default api;
