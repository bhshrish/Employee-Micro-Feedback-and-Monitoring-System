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
exports.listTeams = listTeams;
exports.createTeam = createTeam;
exports.archiveTeam = archiveTeam;
exports.createInvitation = createInvitation;
exports.listMembers = listMembers;
exports.updateMember = updateMember;
exports.ensureTeamAccess = ensureTeamAccess;
var mongoose_1 = require("mongoose");
var Team_1 = require("../models/Team");
var User_1 = require("../models/User");
var Invitation_1 = require("../models/Invitation");
var node_crypto_1 = require("node:crypto");
var env_1 = require("../config/env");
var errors_1 = require("../utils/errors");
function listTeams(organizationId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, Team_1.Team.find({ organizationId: organizationId, archivedAt: null }).sort({ name: 1 }).lean()];
        });
    });
}
function createTeam(organizationId, name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, Team_1.Team.create({ organizationId: organizationId, name: name })];
        });
    });
}
function archiveTeam(organizationId, teamId) {
    return __awaiter(this, void 0, void 0, function () {
        var team;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!mongoose_1.Types.ObjectId.isValid(teamId))
                        throw (0, errors_1.notFound)("Team not found");
                    return [4 /*yield*/, Team_1.Team.exists({ _id: teamId, organizationId: organizationId, archivedAt: null })];
                case 1:
                    if (!(_a.sent()))
                        throw (0, errors_1.notFound)("Team not found");
                    return [4 /*yield*/, User_1.User.exists({ organizationId: organizationId, teamId: teamId })];
                case 2:
                    if (_a.sent())
                        throw (0, errors_1.badRequest)("Reassign team members before archiving this team");
                    return [4 /*yield*/, Team_1.Team.findOneAndUpdate({ _id: teamId, organizationId: organizationId, archivedAt: null }, { $set: { archivedAt: new Date() } }, { new: true })];
                case 3:
                    team = _a.sent();
                    if (!team)
                        throw (0, errors_1.notFound)("Team not found");
                    return [2 /*return*/, team];
            }
        });
    });
}
function createInvitation(organizationId, inviterId, email, teamId) {
    return __awaiter(this, void 0, void 0, function () {
        var team, rawToken, tokenHash, expiresAt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!mongoose_1.Types.ObjectId.isValid(teamId))
                        throw (0, errors_1.notFound)("Team not found");
                    return [4 /*yield*/, Team_1.Team.findOne({ _id: teamId, organizationId: organizationId, archivedAt: null })];
                case 1:
                    team = _a.sent();
                    if (!team)
                        throw (0, errors_1.notFound)("Team not found");
                    return [4 /*yield*/, User_1.User.exists({ email: email.toLowerCase() })];
                case 2:
                    if (_a.sent())
                        throw (0, errors_1.badRequest)("An account with this email already exists");
                    rawToken = (0, node_crypto_1.randomBytes)(32).toString("base64url");
                    tokenHash = (0, node_crypto_1.createHmac)("sha256", (0, env_1.getConfig)().JWT_REFRESH_SECRET).update(rawToken).digest("hex");
                    expiresAt = new Date(Date.now() + 7 * 86400000);
                    return [4 /*yield*/, Invitation_1.Invitation.updateMany({ organizationId: organizationId, email: email.toLowerCase(), acceptedAt: null }, { $set: { acceptedAt: new Date() } })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, Invitation_1.Invitation.create({ organizationId: organizationId, teamId: teamId, inviterId: inviterId, email: email.toLowerCase(), tokenHash: tokenHash, expiresAt: expiresAt })];
                case 4:
                    _a.sent();
                    return [2 /*return*/, { email: email.toLowerCase(), teamId: teamId.toString(), expiresAt: expiresAt, token: rawToken }];
            }
        });
    });
}
function listMembers(organizationId, teamId) {
    return __awaiter(this, void 0, void 0, function () {
        var users;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, User_1.User.find(__assign({ organizationId: organizationId }, (teamId ? { teamId: teamId } : {}))).select("name email role teamId createdAt").populate("teamId", "name").sort({ name: 1 }).lean()];
                case 1:
                    users = _a.sent();
                    return [2 /*return*/, users];
            }
        });
    });
}
function updateMember(organizationId, actorId, memberId, input) {
    return __awaiter(this, void 0, void 0, function () {
        var update, _a, user;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!mongoose_1.Types.ObjectId.isValid(memberId))
                        throw (0, errors_1.notFound)("Member not found");
                    if (actorId.toString() === memberId && input.role)
                        throw (0, errors_1.badRequest)("You cannot change your own role");
                    update = {};
                    if (input.role)
                        update.role = input.role;
                    if (!(input.teamId !== undefined)) return [3 /*break*/, 4];
                    if (!(input.teamId !== null)) return [3 /*break*/, 3];
                    _a = !mongoose_1.Types.ObjectId.isValid(input.teamId);
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, Team_1.Team.exists({ _id: input.teamId, organizationId: organizationId, archivedAt: null })];
                case 1:
                    _a = !(_b.sent());
                    _b.label = 2;
                case 2:
                    if (_a) {
                        throw (0, errors_1.badRequest)("Team does not belong to this workspace");
                    }
                    _b.label = 3;
                case 3:
                    update.teamId = input.teamId;
                    _b.label = 4;
                case 4: return [4 /*yield*/, User_1.User.findOneAndUpdate({ _id: memberId, organizationId: organizationId }, { $set: update }, { new: true })
                        .select("name email role teamId organizationId")];
                case 5:
                    user = _b.sent();
                    if (!user)
                        throw (0, errors_1.notFound)("Member not found");
                    return [2 /*return*/, user];
            }
        });
    });
}
function ensureTeamAccess(organizationId, teamId, actorTeamId, canViewAll) {
    return __awaiter(this, void 0, void 0, function () {
        var team;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!mongoose_1.Types.ObjectId.isValid(teamId))
                        throw (0, errors_1.notFound)("Team not found");
                    return [4 /*yield*/, Team_1.Team.findOne({ _id: teamId, organizationId: organizationId, archivedAt: null }).lean()];
                case 1:
                    team = _a.sent();
                    if (!team)
                        throw (0, errors_1.notFound)("Team not found");
                    if (!canViewAll && (actorTeamId === null || actorTeamId === void 0 ? void 0 : actorTeamId.toString()) !== teamId)
                        throw (0, errors_1.forbidden)("You can only view your assigned team");
                    return [2 /*return*/, team];
            }
        });
    });
}
