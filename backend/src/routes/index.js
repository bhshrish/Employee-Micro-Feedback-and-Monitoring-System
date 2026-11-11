"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const authController = __importStar(require("../controllers/auth.controller"));
const operationsController = __importStar(require("../controllers/operations.controller"));
const adminController = __importStar(require("../controllers/admin.controller"));
const attendanceController = __importStar(require("../controllers/attendance.controller"));
const activityController = __importStar(require("../controllers/activity.controller"));
const analyticsController = __importStar(require("../controllers/analytics.controller"));
const billingController = __importStar(require("../controllers/billing.controller"));
const pulseController = __importStar(require("../controllers/pulse.controller"));
const reportController = __importStar(require("../controllers/report.controller"));
const workspaceController = __importStar(require("../controllers/workspace.controller"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../schemas");
const Alert_1 = require("../models/Alert");
const Organization_1 = require("../models/Organization");
const errors_1 = require("../utils/errors");
const async_handler_1 = require("../utils/async-handler");
const api = (0, express_1.Router)();
const teamFeature = (0, auth_1.requirePlan)("Team", "Business");
const activeWorkspace = auth_1.requireEntitlement;
const authRoutes = (0, express_1.Router)();
authRoutes.post("/signup", (0, validate_1.validateBody)(schemas_1.signupSchema), authController.signup);
authRoutes.post("/signin", (0, validate_1.validateBody)(schemas_1.signinSchema), authController.signin);
authRoutes.post("/login", (0, validate_1.validateBody)(schemas_1.signinSchema), authController.signin);
authRoutes.post("/accept-invitation", (0, validate_1.validateBody)(schemas_1.invitationAcceptSchema), authController.acceptInvitation);
authRoutes.post("/forgot-password", (0, validate_1.validateBody)(schemas_1.forgotPasswordSchema), authController.forgotPassword);
authRoutes.post("/reset-password", (0, validate_1.validateBody)(schemas_1.resetPasswordSchema), authController.resetPassword);
authRoutes.post("/refresh", authController.refresh);
authRoutes.post("/logout", authController.logout);
authRoutes.post("/logout-all", auth_1.authenticate, authController.logoutEverywhere);
authRoutes.get("/me", auth_1.authenticate, authController.me);
authRoutes.patch("/me", auth_1.authenticate, (0, validate_1.validateBody)(schemas_1.profileSchema), authController.updateProfile);
api.use("/auth", authRoutes);
const operationsRoutes = (0, express_1.Router)();
operationsRoutes.post("/auth/signin", (0, validate_1.validateBody)(schemas_1.operationsSigninSchema), operationsController.adminSignIn);
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
api.use("/operations", operationsRoutes);
const adminRoutes = (0, express_1.Router)();
adminRoutes.use(auth_1.authenticate, auth_1.requireEntitlement, (0, auth_1.requireRole)("admin"));
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
api.get("/attendance/me", auth_1.authenticate, attendanceController.current);
api.post("/attendance/check-in", auth_1.authenticate, attendanceController.checkIn);
api.post("/attendance/check-out", auth_1.authenticate, attendanceController.checkOut);
api.get("/health/live", (_req, res) => res.json({ status: "ok" }));
api.get("/health/ready", (_req, res) => {
    if (mongoose_1.default.connection.readyState !== 1) {
        res.status(503).json({ status: "not_ready", dependencies: { mongodb: "unavailable" } });
        return;
    }
    res.json({ status: "ready", dependencies: { mongodb: "ok" } });
});
api.get("/health", (_req, res) => res.json({ status: "ok" }));
const workspaceRoutes = (0, express_1.Router)();
workspaceRoutes.use(auth_1.authenticate, activeWorkspace);
workspaceRoutes.get("/teams", workspaceController.teams);
workspaceRoutes.post("/teams", (0, auth_1.requireRole)("admin"), (0, validate_1.validateBody)(schemas_1.createTeamSchema), workspaceController.createTeam);
workspaceRoutes.post("/invitations", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateBody)(schemas_1.invitationCreateSchema), workspaceController.inviteMember);
workspaceRoutes.delete("/teams/:teamId", (0, auth_1.requireRole)("admin"), (0, validate_1.validateParams)(schemas_1.teamIdParamsSchema), workspaceController.archiveTeam);
workspaceRoutes.get("/members", (0, auth_1.requireRole)("admin", "manager"), workspaceController.members);
workspaceRoutes.patch("/members/:memberId", (0, auth_1.requireRole)("admin"), (0, validate_1.validateParams)(schemas_1.memberIdParamsSchema), (0, validate_1.validateBody)(schemas_1.updateMemberSchema), workspaceController.updateMember);
workspaceRoutes.get("/organization", (0, async_handler_1.asyncHandler)(async (req, res) => {
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
usersRoutes.get("/", (0, auth_1.requireRole)("admin", "manager"), workspaceController.members);
usersRoutes.post("/", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateBody)(schemas_1.invitationCreateSchema), workspaceController.inviteMember);
usersRoutes.post("/invite", (0, auth_1.requireRole)("admin"), (0, validate_1.validateBody)(schemas_1.invitationCreateSchema), workspaceController.inviteMember);
usersRoutes.patch("/:userId", (0, auth_1.requireRole)("admin"), (0, validate_1.validateParams)(schemas_1.userIdParamsSchema), (0, validate_1.validateBody)(schemas_1.updateMemberSchema), workspaceController.updateMember);
usersRoutes.patch("/:userId/role", (0, auth_1.requireRole)("admin"), (0, validate_1.validateParams)(schemas_1.userIdParamsSchema), (0, validate_1.validateBody)(schemas_1.userRoleSchema), workspaceController.updateMember);
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
pulseRoutes.get("/pulse/teams", auth_1.authenticate, activeWorkspace, teamFeature, (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateQuery)(schemas_1.pulseTeamQuerySchema), pulseController.teamScores);
pulseRoutes.get("/alerts", auth_1.authenticate, activeWorkspace, teamFeature, (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateQuery)(schemas_1.alertQuerySchema), pulseController.alerts);
pulseRoutes.patch("/alerts/:alertId", auth_1.authenticate, activeWorkspace, teamFeature, (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateParams)(schemas_1.alertIdParamsSchema), (0, validate_1.validateBody)(schemas_1.alertUpdateSchema), pulseController.updateAlert);
api.use(pulseRoutes);
const analyticsRoutes = (0, express_1.Router)();
analyticsRoutes.use(auth_1.authenticate, activeWorkspace, teamFeature, (0, auth_1.requireRole)("admin", "manager"));
analyticsRoutes.get("/trends", (0, validate_1.validateQuery)(schemas_1.analyticsQuerySchema), analyticsController.trends);
analyticsRoutes.get("/heatmap", (0, validate_1.validateQuery)(schemas_1.analyticsQuerySchema), analyticsController.heatmap);
analyticsRoutes.get("/teams", analyticsController.teams);
analyticsRoutes.get("/teams/:teamId/trend", (0, validate_1.validateParams)(schemas_1.teamIdParamsSchema), (0, validate_1.validateQuery)(schemas_1.analyticsQuerySchema), analyticsController.teamTrend);
api.use("/analytics", analyticsRoutes);
const reportRoutes = (0, express_1.Router)();
reportRoutes.use(auth_1.authenticate);
reportRoutes.get("/preview", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateQuery)(schemas_1.reportQuerySchema), reportController.preview);
reportRoutes.post("/preview", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateBody)(schemas_1.reportGenerateSchema), reportController.previewPost);
reportRoutes.get("/summary", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateQuery)(schemas_1.reportQuerySchema), reportController.summary);
reportRoutes.get("/export", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateQuery)(schemas_1.reportQuerySchema), reportController.download);
reportRoutes.post("/generate", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateBody)(schemas_1.reportGenerateSchema), reportController.generate);
reportRoutes.get("/:reportId/download", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateParams)(schemas_1.reportIdParamsSchema), (0, validate_1.validateQuery)(schemas_1.reportFormatQuerySchema), reportController.downloadGenerated);
reportRoutes.get("/:reportId", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateParams)(schemas_1.reportIdParamsSchema), reportController.downloadGenerated);
api.use("/reports", reportRoutes);
const billingRoutes = (0, express_1.Router)();
billingRoutes.get("/plans", billingController.availablePlans);
billingRoutes.use(auth_1.authenticate);
billingRoutes.post("/checkout", (0, auth_1.requireRole)("admin"), (0, validate_1.validateBody)(schemas_1.checkoutSchema), billingController.checkout);
billingRoutes.post("/checkout-session", (0, auth_1.requireRole)("admin"), (0, validate_1.validateBody)(schemas_1.checkoutSchema), billingController.checkout);
billingRoutes.post("/cancel", (0, auth_1.requireRole)("admin"), billingController.cancel);
billingRoutes.get("/invoices", (0, auth_1.requireRole)("admin"), billingController.listInvoices);
billingRoutes.get("/subscription", billingController.currentSubscription);
billingRoutes.post("/portal-session", (0, auth_1.requireRole)("admin"), billingController.portalSession);
billingRoutes.post("/subscription/portal-session", (0, auth_1.requireRole)("admin"), billingController.portalSession);
api.use("/billing", billingRoutes);
api.get("/alerts/:alertId", auth_1.authenticate, activeWorkspace, teamFeature, (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateParams)(schemas_1.alertIdParamsSchema), (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const alert = await Alert_1.Alert.findOne({
        _id: req.params.alertId,
        organizationId: req.auth.organizationId,
        ...(req.auth.role === "admin" ? {} : { teamId: req.auth.teamId }),
    }).populate("teamId", "name").lean();
    if (!alert)
        throw (0, errors_1.notFound)("Alert not found");
    res.json({ alert });
}));
exports.default = api;
