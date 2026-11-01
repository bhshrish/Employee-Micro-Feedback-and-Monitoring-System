"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mongoose_1 = require("mongoose");
var authController = require("../controllers/auth.controller");
var activityController = require("../controllers/activity.controller");
var analyticsController = require("../controllers/analytics.controller");
var billingController = require("../controllers/billing.controller");
var pulseController = require("../controllers/pulse.controller");
var reportController = require("../controllers/report.controller");
var workspaceController = require("../controllers/workspace.controller");
var auth_1 = require("../middleware/auth");
var validate_1 = require("../middleware/validate");
var schemas_1 = require("../schemas");
var Alert_1 = require("../models/Alert");
var Organization_1 = require("../models/Organization");
var errors_1 = require("../utils/errors");
var async_handler_1 = require("../utils/async-handler");
var api = (0, express_1.Router)();
var teamFeature = (0, auth_1.requirePlan)("Team", "Business");
var activeWorkspace = auth_1.requireEntitlement;
var authRoutes = (0, express_1.Router)();
authRoutes.post("/signup", (0, validate_1.validateBody)(schemas_1.signupSchema), authController.signup);
authRoutes.post("/signin", (0, validate_1.validateBody)(schemas_1.signinSchema), authController.signin);
authRoutes.post("/login", (0, validate_1.validateBody)(schemas_1.signinSchema), authController.signin);
authRoutes.post("/accept-invitation", (0, validate_1.validateBody)(schemas_1.invitationAcceptSchema), authController.acceptInvitation);
authRoutes.post("/refresh", authController.refresh);
authRoutes.post("/logout", authController.logout);
authRoutes.post("/logout-all", auth_1.authenticate, authController.logoutEverywhere);
authRoutes.get("/me", auth_1.authenticate, authController.me);
authRoutes.patch("/me", auth_1.authenticate, (0, validate_1.validateBody)(schemas_1.profileSchema), authController.updateProfile);
api.use("/auth", authRoutes);
api.get("/health/live", function (_req, res) { return res.json({ status: "ok" }); });
api.get("/health/ready", function (_req, res) {
    if (mongoose_1.default.connection.readyState !== 1) {
        res.status(503).json({ status: "not_ready", dependencies: { mongodb: "unavailable" } });
        return;
    }
    res.json({ status: "ready", dependencies: { mongodb: "ok" } });
});
api.get("/health", function (_req, res) { return res.json({ status: "ok" }); });
var workspaceRoutes = (0, express_1.Router)();
workspaceRoutes.use(auth_1.authenticate, activeWorkspace);
workspaceRoutes.get("/teams", workspaceController.teams);
workspaceRoutes.post("/teams", (0, auth_1.requireRole)("admin"), (0, validate_1.validateBody)(schemas_1.createTeamSchema), workspaceController.createTeam);
workspaceRoutes.post("/invitations", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateBody)(schemas_1.invitationCreateSchema), workspaceController.inviteMember);
workspaceRoutes.delete("/teams/:teamId", (0, auth_1.requireRole)("admin"), (0, validate_1.validateParams)(schemas_1.teamIdParamsSchema), workspaceController.archiveTeam);
workspaceRoutes.get("/members", (0, auth_1.requireRole)("admin", "manager"), workspaceController.members);
workspaceRoutes.patch("/members/:memberId", (0, auth_1.requireRole)("admin"), (0, validate_1.validateParams)(schemas_1.memberIdParamsSchema), (0, validate_1.validateBody)(schemas_1.updateMemberSchema), workspaceController.updateMember);
workspaceRoutes.get("/organization", (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var organization;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                return [4 /*yield*/, Organization_1.Organization.findById(req.auth.organizationId).select("name createdAt").lean()];
            case 1:
                organization = _a.sent();
                if (!organization)
                    throw (0, errors_1.notFound)("Workspace not found");
                res.json({ organization: organization });
                return [2 /*return*/];
        }
    });
}); }));
api.use("/workspace", workspaceRoutes);
var usersRoutes = (0, express_1.Router)();
usersRoutes.use(auth_1.authenticate, activeWorkspace);
usersRoutes.get("/me", authController.me);
usersRoutes.patch("/me", (0, validate_1.validateBody)(schemas_1.profileSchema), authController.updateProfile);
usersRoutes.get("/", (0, auth_1.requireRole)("admin", "manager"), workspaceController.members);
usersRoutes.post("/", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateBody)(schemas_1.invitationCreateSchema), workspaceController.inviteMember);
usersRoutes.post("/invite", (0, auth_1.requireRole)("admin"), (0, validate_1.validateBody)(schemas_1.invitationCreateSchema), workspaceController.inviteMember);
usersRoutes.patch("/:userId", (0, auth_1.requireRole)("admin"), (0, validate_1.validateParams)(schemas_1.userIdParamsSchema), (0, validate_1.validateBody)(schemas_1.updateMemberSchema), workspaceController.updateMember);
usersRoutes.patch("/:userId/role", (0, auth_1.requireRole)("admin"), (0, validate_1.validateParams)(schemas_1.userIdParamsSchema), (0, validate_1.validateBody)(schemas_1.userRoleSchema), workspaceController.updateMember);
api.use("/users", usersRoutes);
var activityRoutes = (0, express_1.Router)();
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
var pulseRoutes = (0, express_1.Router)();
pulseRoutes.post("/pulse", auth_1.authenticate, activeWorkspace, (0, validate_1.validateBody)(schemas_1.pulseSchema), pulseController.submit);
pulseRoutes.get("/pulse/me", auth_1.authenticate, activeWorkspace, pulseController.submissionStatus);
pulseRoutes.post("/pulses", auth_1.authenticate, activeWorkspace, (0, validate_1.validateBody)(schemas_1.pulseSchema), pulseController.submit);
pulseRoutes.get("/pulses/status", auth_1.authenticate, activeWorkspace, pulseController.submissionStatus);
pulseRoutes.get("/pulse/teams", auth_1.authenticate, activeWorkspace, teamFeature, (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateQuery)(schemas_1.pulseTeamQuerySchema), pulseController.teamScores);
pulseRoutes.get("/alerts", auth_1.authenticate, activeWorkspace, teamFeature, (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateQuery)(schemas_1.alertQuerySchema), pulseController.alerts);
pulseRoutes.patch("/alerts/:alertId", auth_1.authenticate, activeWorkspace, teamFeature, (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateParams)(schemas_1.alertIdParamsSchema), (0, validate_1.validateBody)(schemas_1.alertUpdateSchema), pulseController.updateAlert);
api.use(pulseRoutes);
var analyticsRoutes = (0, express_1.Router)();
analyticsRoutes.use(auth_1.authenticate, activeWorkspace, teamFeature, (0, auth_1.requireRole)("admin", "manager"));
analyticsRoutes.get("/trends", (0, validate_1.validateQuery)(schemas_1.analyticsQuerySchema), analyticsController.trends);
analyticsRoutes.get("/heatmap", (0, validate_1.validateQuery)(schemas_1.analyticsQuerySchema), analyticsController.heatmap);
analyticsRoutes.get("/teams", analyticsController.teams);
analyticsRoutes.get("/teams/:teamId/trend", (0, validate_1.validateParams)(schemas_1.teamIdParamsSchema), (0, validate_1.validateQuery)(schemas_1.analyticsQuerySchema), analyticsController.teamTrend);
api.use("/analytics", analyticsRoutes);
var reportRoutes = (0, express_1.Router)();
reportRoutes.use(auth_1.authenticate);
reportRoutes.get("/preview", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateQuery)(schemas_1.reportQuerySchema), reportController.preview);
reportRoutes.post("/preview", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateBody)(schemas_1.reportGenerateSchema), reportController.previewPost);
reportRoutes.get("/summary", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateQuery)(schemas_1.reportQuerySchema), reportController.summary);
reportRoutes.get("/export", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateQuery)(schemas_1.reportQuerySchema), reportController.download);
reportRoutes.post("/generate", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateBody)(schemas_1.reportGenerateSchema), reportController.generate);
reportRoutes.get("/:reportId/download", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateParams)(schemas_1.reportIdParamsSchema), (0, validate_1.validateQuery)(schemas_1.reportFormatQuerySchema), reportController.downloadGenerated);
reportRoutes.get("/:reportId", (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateParams)(schemas_1.reportIdParamsSchema), reportController.downloadGenerated);
api.use("/reports", reportRoutes);
var billingRoutes = (0, express_1.Router)();
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
api.get("/alerts/:alertId", auth_1.authenticate, activeWorkspace, teamFeature, (0, auth_1.requireRole)("admin", "manager"), (0, validate_1.validateParams)(schemas_1.alertIdParamsSchema), (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var alert;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                return [4 /*yield*/, Alert_1.Alert.findOne(__assign({ _id: req.params.alertId, organizationId: req.auth.organizationId }, (req.auth.role === "admin" ? {} : { teamId: req.auth.teamId }))).populate("teamId", "name").lean()];
            case 1:
                alert = _a.sent();
                if (!alert)
                    throw (0, errors_1.notFound)("Alert not found");
                res.json({ alert: alert });
                return [2 /*return*/];
        }
    });
}); }));
exports.default = api;
