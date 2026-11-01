"use strict";
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
exports.archiveTeam = exports.updateMember = exports.members = exports.inviteMember = exports.createTeam = exports.teams = void 0;
var async_handler_1 = require("../utils/async-handler");
var workspace = require("../services/workspace.service");
var errors_1 = require("../utils/errors");
exports.teams = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                _b = (_a = res).json;
                _c = {};
                return [4 /*yield*/, workspace.listTeams(req.auth.organizationId)];
            case 1:
                _b.apply(_a, [(_c.teams = _d.sent(), _c)]);
                return [2 /*return*/];
        }
    });
}); });
exports.createTeam = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var team;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                return [4 /*yield*/, workspace.createTeam(req.auth.organizationId, req.body.name)];
            case 1:
                team = _a.sent();
                res.status(201).json({ team: team });
                return [2 /*return*/];
        }
    });
}); });
exports.inviteMember = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var invitation, result;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                if (req.auth.role === "manager" && ((_a = req.auth.teamId) === null || _a === void 0 ? void 0 : _a.toString()) !== req.body.teamId) {
                    throw (0, errors_1.forbidden)("Managers can invite members only to their assigned team");
                }
                return [4 /*yield*/, workspace.createInvitation(req.auth.organizationId, req.auth.userId, req.body.email, req.body.teamId)];
            case 1:
                invitation = _b.sent();
                result = {
                    email: invitation.email,
                    teamId: invitation.teamId,
                    expiresAt: invitation.expiresAt,
                    token: invitation.token,
                };
                res.status(201).json({ invitation: result, data: { invitation: result } });
                return [2 /*return*/];
        }
    });
}); });
exports.members = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var teamId, _a, _b;
    var _c;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                teamId = req.auth.role === "admin" ? undefined : (_d = req.auth.teamId) !== null && _d !== void 0 ? _d : undefined;
                if (req.auth.role !== "admin" && !teamId)
                    throw (0, errors_1.forbidden)("A manager must be assigned to a team");
                _b = (_a = res).json;
                _c = {};
                return [4 /*yield*/, workspace.listMembers(req.auth.organizationId, teamId)];
            case 1:
                _b.apply(_a, [(_c.members = _e.sent(), _c)]);
                return [2 /*return*/];
        }
    });
}); });
exports.updateMember = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var member;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                return [4 /*yield*/, workspace.updateMember(req.auth.organizationId, req.auth.userId, (_a = req.params.memberId) !== null && _a !== void 0 ? _a : req.params.userId, req.body)];
            case 1:
                member = _b.sent();
                res.json({ member: member });
                return [2 /*return*/];
        }
    });
}); });
exports.archiveTeam = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var team;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                return [4 /*yield*/, workspace.archiveTeam(req.auth.organizationId, req.params.teamId)];
            case 1:
                team = _a.sent();
                res.json({ team: team });
                return [2 /*return*/];
        }
    });
}); });
