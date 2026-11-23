import type { Request, Response } from "express";

interface AuthContext {
    userId: import("mongoose").Types.ObjectId;
    organizationId: import("mongoose").Types.ObjectId;
    teamId: import("mongoose").Types.ObjectId | null;
    role: import("../types/roles").UserRole;
}

interface RouteRequest extends Request { auth?: AuthContext; }

import * as express_1 from "express";
import mongoose_1 from "mongoose";
import * as authController from "../controllers/auth.controller";
import * as operationsController from "../controllers/operations.controller";
import * as adminController from "../controllers/admin.controller";
import * as attendanceController from "../controllers/attendance.controller";
import * as activityController from "../controllers/activity.controller";
import * as analyticsController from "../controllers/analytics.controller";
import * as pulseController from "../controllers/pulse.controller";
import * as reportController from "../controllers/report.controller";
import * as workspaceController from "../controllers/workspace.controller";
import * as employeeToolsController from "../controllers/employee-tools.controller";
import * as auth_1 from "../middleware/auth";
import * as validate_1 from "../middleware/validate";
import * as schemas_1 from "../schemas";
import * as Alert_1 from "../models/Alert";
import * as Organization_1 from "../models/Organization";
import * as errors_1 from "../utils/errors";
import * as async_handler_1 from "../utils/async-handler";
const api = (0, express_1.Router)();
const teamFeature = (0, auth_1.requirePlan)("Team", "Business");
const activeWorkspace = auth_1.requireEntitlement;
const authRoutes = (0, express_1.Router)();
    authRoutes.post("/signup", (0, validate_1.validateBody)(schemas_1.signupSchema), authController.signup);
    authRoutes.post("/signup/session", (0, validate_1.validateBody)(schemas_1.signupSchema), authController.signupSession);
    authRoutes.post("/signin", (0, validate_1.validateBody)(schemas_1.signinSchema), authController.signin);
    authRoutes.post("/login", (0, validate_1.validateBody)(schemas_1.signinSchema), authController.signin);
    authRoutes.post("/accept-invitation", (0, validate_1.validateBody)(schemas_1.invitationAcceptSchema), authController.acceptInvitation);
    authRoutes.post("/accept-invitation/session", (0, validate_1.validateBody)(schemas_1.invitationAcceptSchema), authController.acceptInvitationSession);
authRoutes.post("/forgot-password", (0, validate_1.validateBody)(schemas_1.forgotPasswordSchema), authController.forgotPassword);
authRoutes.post("/reset-password", (0, validate_1.validateBody)(schemas_1.resetPasswordSchema), authController.resetPassword);
authRoutes.post("/email-change/verify", (0, validate_1.validateBody)(schemas_1.emailChangeVerificationSchema), authController.verifyEmailChange);
authRoutes.post("/otp/request", (0, validate_1.validateBody)(schemas_1.otpRequestSchema), authController.requestOtp);
authRoutes.post("/otp/verify", (0, validate_1.validateBody)(schemas_1.otpVerifySchema), authController.verifyOtp);
authRoutes.post("/refresh", authController.refresh);
authRoutes.post("/logout", authController.logout);
authRoutes.post("/logout-all", auth_1.authenticate, authController.logoutEverywhere);
authRoutes.get("/me", auth_1.authenticate, authController.me);
authRoutes.patch("/me", auth_1.authenticate, (0, validate_1.validateBody)(schemas_1.profileSchema), authController.updateProfile);
api.use("/auth", authRoutes);
const operationsRoutes = (0, express_1.Router)();
operationsRoutes.post("/auth/login", (0, validate_1.validateBody)(schemas_1.adminPasswordSigninSchema), operationsController.signInAdminWithPassword);
operationsRoutes.post("/auth/otp/request", (0, validate_1.validateBody)(schemas_1.adminOtpRequestSchema), operationsController.requestAdminOtp);
operationsRoutes.post("/auth/otp/verify", (0, validate_1.validateBody)(schemas_1.adminOtpVerifySchema), operationsController.verifyAdminOtp);
operationsRoutes.post("/auth/logout", auth_1.requireOperationsAdmin, operationsController.adminSignOut);
operationsRoutes.get("/auth/me", auth_1.requireOperationsAdmin, operationsController.adminMe);
operationsRoutes.use(auth_1.requireOperationsAdmin);
operationsRoutes.get("/overview", operationsController.overview);
operationsRoutes.get("/businesses", (0, validate_1.validateQuery)(schemas_1.operationsListQuerySchema), operationsController.businesses);
operationsRoutes.patch("/businesses/:businessId", (0, validate_1.validateParams)(schemas_1.businessIdParamsSchema), (0, validate_1.validateBody)(schemas_1.operationsStatusSchema), operationsController.updateBusiness);
operationsRoutes.get("/users", (0, validate_1.validateQuery)(schemas_1.operationsListQuerySchema), operationsController.users);
operationsRoutes.patch("/users/:userId", (0, validate_1.validateParams)(schemas_1.userIdParamsSchema), (0, validate_1.validateBody)(schemas_1.operationsStatusSchema), operationsController.updateUser);
operationsRoutes.patch("/users/:userId/team", (0, validate_1.validateParams)(schemas_1.userIdParamsSchema), (0, validate_1.validateBody)(schemas_1.operationsTeamAssignmentSchema), operationsController.assignTeam);
operationsRoutes.get("/teams", operationsController.teams);
operationsRoutes.post("/teams", (0, validate_1.validateBody)(schemas_1.operationsTeamCreateSchema), operationsController.createTeam);
operationsRoutes.delete("/teams/:teamId", (0, validate_1.validateParams)(schemas_1.teamIdParamsSchema), operationsController.archiveTeam);
operationsRoutes.get("/activity", (0, validate_1.validateQuery)(schemas_1.operationsDateQuerySchema), operationsController.activity);
operationsRoutes.get("/attendance", (0, validate_1.validateQuery)(schemas_1.operationsDateQuerySchema), operationsController.attendance);
operationsRoutes.get("/attendance/export", (0, validate_1.validateQuery)(schemas_1.operationsDateQuerySchema), operationsController.attendanceExport);
operationsRoutes.get("/leave", operationsController.leaveApplications);
operationsRoutes.patch("/leave/:toolId", (0, validate_1.validateParams)(schemas_1.toolIdParamsSchema), (0, validate_1.validateBody)(schemas_1.leaveDecisionSchema), operationsController.decideLeaveApplication);
api.use("/operations", operationsRoutes);
const adminRoutes = (0, express_1.Router)();
adminRoutes.use(auth_1.authenticate, auth_1.requireEntitlement, (0, auth_1.requireRole)("business"));
adminRoutes.get("/overview", adminController.overview);
adminRoutes.get("/members", (0, validate_1.validateQuery)(schemas_1.adminListQuerySchema), adminController.members);
adminRoutes.patch("/members/:userId", (0, validate_1.validateParams)(schemas_1.userIdParamsSchema), (0, validate_1.validateBody)(schemas_1.adminUserUpdateSchema), adminController.updateMember);
adminRoutes.get("/invitations", adminController.invitations);
adminRoutes.post("/invitations", (0, validate_1.validateBody)(schemas_1.adminInviteSchema), adminController.invite);
adminRoutes.post("/invitations/:email/resend", (0, validate_1.validateParams)(schemas_1.adminEmailParamsSchema), adminController.resendInvite);
adminRoutes.delete("/invitations/:invitationId", (0, validate_1.validateParams)(schemas_1.invitationIdParamsSchema), adminController.cancelInvite);
adminRoutes.get("/teams", adminController.teams);
adminRoutes.post("/teams", (0, validate_1.validateBody)(schemas_1.adminTeamSchema), adminController.createTeam);
adminRoutes.patch("/teams/:teamId", (0, validate_1.validateParams)(schemas_1.teamIdParamsSchema), (0, validate_1.validateBody)(schemas_1.adminTeamSchema), adminController.renameTeam);
adminRoutes.delete("/teams/:teamId", (0, validate_1.validateParams)(schemas_1.teamIdParamsSchema), adminController.archiveTeam);
adminRoutes.get("/alerts", (0, validate_1.validateQuery)(schemas_1.adminAlertQuerySchema), adminController.alerts);
adminRoutes.patch("/alerts/:alertId", (0, validate_1.validateParams)(schemas_1.alertIdParamsSchema), (0, validate_1.validateBody)(schemas_1.adminAlertUpdateSchema), adminController.updateAlert);
adminRoutes.get("/reports", (0, validate_1.validateQuery)(schemas_1.adminReportQuerySchema), adminController.reports);
adminRoutes.get("/audit-logs", (0, validate_1.validateQuery)(schemas_1.adminAuditQuerySchema), adminController.auditLogs);
adminRoutes.get("/settings", adminController.settings);
adminRoutes.patch("/settings", (0, validate_1.validateBody)(schemas_1.adminSettingsSchema), adminController.updateSettings);
api.use("/admin", adminRoutes);
const employeeToolsRoutes = (0, express_1.Router)();
employeeToolsRoutes.use(auth_1.authenticate, activeWorkspace);
employeeToolsRoutes.get("/planner", employeeToolsController.listPlanner);
employeeToolsRoutes.post("/planner", (0, validate_1.validateBody)(schemas_1.plannerCreateSchema), employeeToolsController.createPlanner);
employeeToolsRoutes.patch("/planner/:toolId", (0, validate_1.validateParams)(schemas_1.toolIdParamsSchema), (0, validate_1.validateBody)(schemas_1.plannerUpdateSchema), employeeToolsController.updatePlanner);
employeeToolsRoutes.delete("/planner/:toolId", (0, validate_1.validateParams)(schemas_1.toolIdParamsSchema), employeeToolsController.deletePlanner);
employeeToolsRoutes.get("/leave", employeeToolsController.listLeave);
employeeToolsRoutes.post("/leave", (0, auth_1.requireRole)("individual"), (0, validate_1.validateBody)(schemas_1.leaveCreateSchema), employeeToolsController.createLeave);
employeeToolsRoutes.patch("/leave/:toolId/decision", (0, auth_1.requireRole)("business"), (0, validate_1.validateParams)(schemas_1.toolIdParamsSchema), (0, validate_1.validateBody)(schemas_1.leaveDecisionSchema), employeeToolsController.decideLeave);
employeeToolsRoutes.get("/calendar", employeeToolsController.listCalendar);
employeeToolsRoutes.post("/calendar", (0, validate_1.validateBody)(schemas_1.calendarEventSchema), employeeToolsController.createCalendarEvent);
api.use("/tools", employeeToolsRoutes);
api.get("/attendance/me", auth_1.authenticate, attendanceController.current);
api.post("/attendance/check-in", auth_1.authenticate, attendanceController.checkIn);
api.post("/attendance/check-out", auth_1.authenticate, attendanceController.checkOut);
api.get("/health/live", (_req: RouteRequest, res: Response) => res.json({ status: "ok" }));
api.get("/health/ready", (_req: RouteRequest, res: Response) => {
    if (mongoose_1.connection.readyState !== 1) {
        res.status(503).json({ status: "not_ready", dependencies: { mongodb: "unavailable" } });
        return;
    }
    res.json({ status: "ready", dependencies: { mongodb: "ok" } });
});
api.get("/health", (_req: RouteRequest, res: Response) => res.json({ status: "ok" }));
const workspaceRoutes = (0, express_1.Router)();
workspaceRoutes.use(auth_1.authenticate, activeWorkspace);
workspaceRoutes.get("/teams", (0, auth_1.requireRole)("business"), workspaceController.teams);
workspaceRoutes.post("/teams", (0, auth_1.requireRole)("business"), (0, validate_1.validateBody)(schemas_1.createTeamSchema), workspaceController.createTeam);
workspaceRoutes.post("/invitations", (0, auth_1.requireRole)("business"), (0, validate_1.validateBody)(schemas_1.invitationCreateSchema), workspaceController.inviteMember);
workspaceRoutes.delete("/teams/:teamId", (0, auth_1.requireRole)("business"), (0, validate_1.validateParams)(schemas_1.teamIdParamsSchema), workspaceController.archiveTeam);
workspaceRoutes.get("/members", (0, auth_1.requireRole)("business"), workspaceController.members);
workspaceRoutes.patch("/members/:memberId", (0, auth_1.requireRole)("business"), (0, validate_1.validateParams)(schemas_1.memberIdParamsSchema), (0, validate_1.validateBody)(schemas_1.updateMemberSchema), workspaceController.updateMember);
workspaceRoutes.get("/organization", (0, auth_1.requireRole)("business"), (0, async_handler_1.asyncHandler)(async (req: RouteRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const organization = await Organization_1.Organization.findById(req.auth.organizationId).select("name createdAt").lean();
    if (!organization)
        throw (0, errors_1.notFound)("Workspace not found");
    res.json({ organization });
}));
api.use("/workspace", workspaceRoutes);
const usersRoutes = (0, express_1.Router)();
usersRoutes.use(auth_1.authenticate, activeWorkspace);
usersRoutes.get("/me", authController.me);
usersRoutes.patch("/me", (0, validate_1.validateBody)(schemas_1.profileSchema), authController.updateProfile);
usersRoutes.get("/", (0, auth_1.requireRole)("business"), workspaceController.members);
usersRoutes.post("/", (0, auth_1.requireRole)("business"), (0, validate_1.validateBody)(schemas_1.invitationCreateSchema), workspaceController.inviteMember);
usersRoutes.post("/invite", (0, auth_1.requireRole)("business"), (0, validate_1.validateBody)(schemas_1.invitationCreateSchema), workspaceController.inviteMember);
usersRoutes.patch("/:userId", (0, auth_1.requireRole)("business"), (0, validate_1.validateParams)(schemas_1.userIdParamsSchema), (0, validate_1.validateBody)(schemas_1.updateMemberSchema), workspaceController.updateMember);
usersRoutes.patch("/:userId/role", (0, auth_1.requireRole)("business"), (0, validate_1.validateParams)(schemas_1.userIdParamsSchema), (0, validate_1.validateBody)(schemas_1.userRoleSchema), workspaceController.updateMember);
api.use("/users", usersRoutes);
const activityRoutes = (0, express_1.Router)();
activityRoutes.get("/sessions", auth_1.authenticate, activeWorkspace, (0, validate_1.validateQuery)(schemas_1.historyQuerySchema), activityController.history);
activityRoutes.get("/dashboard", auth_1.authenticate, activeWorkspace, (0, validate_1.validateQuery)(schemas_1.dashboardQuerySchema), activityController.dashboard);
activityRoutes.post("/sessions", auth_1.authenticate, activeWorkspace, (0, validate_1.validateBody)(schemas_1.startActivitySchema), activityController.start);
activityRoutes.post("/sessions/start", auth_1.authenticate, activeWorkspace, (0, validate_1.validateBody)(schemas_1.startActivitySchema), activityController.start);
activityRoutes.post("/sessions/:sessionId/heartbeat", auth_1.authenticate, activeWorkspace, (0, validate_1.validateParams)(schemas_1.sessionIdParamsSchema), activityController.heartbeat);
activityRoutes.post("/sessions/heartbeat", auth_1.authenticate, activeWorkspace, (0, validate_1.validateBody)(schemas_1.activityHeartbeatSchema), activityController.heartbeat);
activityRoutes.post("/sessions/:sessionId/idle", auth_1.authenticate, activeWorkspace, (0, validate_1.validateParams)(schemas_1.sessionIdParamsSchema), (0, validate_1.validateBody)(schemas_1.idleActivitySchema), activityController.idle);
activityRoutes.patch("/sessions/:sessionId/tags", auth_1.authenticate, activeWorkspace, (0, validate_1.validateParams)(schemas_1.sessionIdParamsSchema), (0, validate_1.validateBody)(schemas_1.activityTagsSchema), activityController.tags);
activityRoutes.post("/sessions/:sessionId/tags", auth_1.authenticate, activeWorkspace, (0, validate_1.validateParams)(schemas_1.sessionIdParamsSchema), (0, validate_1.validateBody)(schemas_1.activityTagsSchema), activityController.tags);
activityRoutes.get("/sessions/history", auth_1.authenticate, activeWorkspace, (0, validate_1.validateQuery)(schemas_1.historyQuerySchema), activityController.history);
activityRoutes.get("/sessions/summary", auth_1.authenticate, activeWorkspace, (0, validate_1.validateQuery)(schemas_1.sessionSummaryQuerySchema), activityController.summary);
activityRoutes.post("/sessions/:sessionId/pause", auth_1.authenticate, activeWorkspace, (0, validate_1.validateParams)(schemas_1.sessionIdParamsSchema), activityController.pause);
activityRoutes.post("/sessions/:sessionId/resume", auth_1.authenticate, activeWorkspace, (0, validate_1.validateParams)(schemas_1.sessionIdParamsSchema), activityController.resume);
activityRoutes.post("/sessions/:sessionId/stop", auth_1.authenticate, activeWorkspace, (0, validate_1.validateParams)(schemas_1.sessionIdParamsSchema), (0, validate_1.validateBody)(schemas_1.stopActivitySchema), activityController.stop);
api.use(activityRoutes);
const pulseRoutes = (0, express_1.Router)();
pulseRoutes.post("/pulse", auth_1.authenticate, activeWorkspace, (0, validate_1.validateBody)(schemas_1.pulseSchema), pulseController.submit);
pulseRoutes.get("/pulse/me", auth_1.authenticate, activeWorkspace, pulseController.submissionStatus);
pulseRoutes.post("/pulses", auth_1.authenticate, activeWorkspace, (0, validate_1.validateBody)(schemas_1.pulseSchema), pulseController.submit);
pulseRoutes.get("/pulses/status", auth_1.authenticate, activeWorkspace, pulseController.submissionStatus);
pulseRoutes.get("/pulse/teams", auth_1.authenticate, activeWorkspace, teamFeature, (0, auth_1.requireRole)("business"), (0, validate_1.validateQuery)(schemas_1.pulseTeamQuerySchema), pulseController.teamScores);
pulseRoutes.get("/alerts", auth_1.authenticate, activeWorkspace, teamFeature, (0, auth_1.requireRole)("business"), (0, validate_1.validateQuery)(schemas_1.alertQuerySchema), pulseController.alerts);
pulseRoutes.patch("/alerts/:alertId", auth_1.authenticate, activeWorkspace, teamFeature, (0, auth_1.requireRole)("business"), (0, validate_1.validateParams)(schemas_1.alertIdParamsSchema), (0, validate_1.validateBody)(schemas_1.alertUpdateSchema), pulseController.updateAlert);
api.use(pulseRoutes);
const analyticsRoutes = (0, express_1.Router)();
analyticsRoutes.use(auth_1.authenticate, activeWorkspace, teamFeature, (0, auth_1.requireRole)("business"));
analyticsRoutes.get("/trends", (0, validate_1.validateQuery)(schemas_1.analyticsQuerySchema), analyticsController.trends);
analyticsRoutes.get("/heatmap", (0, validate_1.validateQuery)(schemas_1.analyticsQuerySchema), analyticsController.heatmap);
analyticsRoutes.get("/teams", analyticsController.teams);
analyticsRoutes.get("/teams/:teamId/trend", (0, validate_1.validateParams)(schemas_1.teamIdParamsSchema), (0, validate_1.validateQuery)(schemas_1.analyticsQuerySchema), analyticsController.teamTrend);
api.use("/analytics", analyticsRoutes);
const reportRoutes = (0, express_1.Router)();
reportRoutes.use(auth_1.authenticate);
reportRoutes.get("/preview", (0, auth_1.requireRole)("business"), (0, validate_1.validateQuery)(schemas_1.reportQuerySchema), reportController.preview);
reportRoutes.post("/preview", (0, auth_1.requireRole)("business"), (0, validate_1.validateBody)(schemas_1.reportGenerateSchema), reportController.previewPost);
reportRoutes.get("/summary", (0, auth_1.requireRole)("business"), (0, validate_1.validateQuery)(schemas_1.reportQuerySchema), reportController.summary);
reportRoutes.post("/generate", (0, auth_1.requireRole)("business"), (0, validate_1.validateBody)(schemas_1.reportGenerateSchema), reportController.generate);
reportRoutes.get("/:reportId/download", (0, auth_1.requireRole)("business"), (0, validate_1.validateParams)(schemas_1.reportIdParamsSchema), (0, validate_1.validateQuery)(schemas_1.reportFormatQuerySchema), reportController.downloadGenerated);
reportRoutes.get("/:reportId", (0, auth_1.requireRole)("business"), (0, validate_1.validateParams)(schemas_1.reportIdParamsSchema), reportController.downloadGenerated);
api.use("/reports", reportRoutes);
api.get("/alerts/:alertId", auth_1.authenticate, activeWorkspace, teamFeature, (0, auth_1.requireRole)("business"), (0, validate_1.validateParams)(schemas_1.alertIdParamsSchema), (0, async_handler_1.asyncHandler)(async (req: RouteRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const alert = await Alert_1.Alert.findOne({
        _id: req.params.alertId,
        organizationId: req.auth.organizationId,
        ...(req.auth.role === "business" ? {} : { teamId: req.auth.teamId }),
    }).populate("teamId", "name").lean();
    if (!alert)
        throw (0, errors_1.notFound)("Alert not found");
    res.json({ alert });
}));
export default api;
