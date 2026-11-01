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
exports.signup = signup;
exports.signin = signin;
exports.acceptInvitation = acceptInvitation;
exports.rotateRefreshToken = rotateRefreshToken;
exports.revokeRefreshToken = revokeRefreshToken;
exports.revokeAllRefreshTokens = revokeAllRefreshTokens;
exports.getCurrentUser = getCurrentUser;
var node_crypto_1 = require("node:crypto");
var bcryptjs_1 = require("bcryptjs");
var jsonwebtoken_1 = require("jsonwebtoken");
var mongoose_1 = require("mongoose");
var env_1 = require("../config/env");
var Organization_1 = require("../models/Organization");
var Invitation_1 = require("../models/Invitation");
var RefreshToken_1 = require("../models/RefreshToken");
var Team_1 = require("../models/Team");
var User_1 = require("../models/User");
var errors_1 = require("../utils/errors");
var BCRYPT_ROUNDS = 12;
function hashRefreshToken(token) {
    return (0, node_crypto_1.createHmac)("sha256", (0, env_1.getConfig)().JWT_REFRESH_SECRET).update(token).digest("hex");
}
function accessToken(user) {
    return jsonwebtoken_1.sign({ typ: "access", org: user.organizationId.toString(), role: user.role }, (0, env_1.getConfig)().JWT_ACCESS_SECRET, {
        subject: user._id.toString(),
        expiresIn: (0, env_1.getConfig)().ACCESS_TOKEN_TTL,
        issuer: "pulse-api",
        audience: "pulse-client",
    });
}
function createRefreshToken(userId_1) {
    return __awaiter(this, arguments, void 0, function (userId, familyId) {
        var raw;
        if (familyId === void 0) { familyId = (0, node_crypto_1.randomUUID)(); }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    raw = (0, node_crypto_1.randomBytes)(48).toString("base64url");
                    return [4 /*yield*/, RefreshToken_1.RefreshToken.create({
                            userId: userId,
                            tokenHash: hashRefreshToken(raw),
                            familyId: familyId,
                            expiresAt: new Date(Date.now() + (0, env_1.getConfig)().REFRESH_TOKEN_DAYS * 86400000),
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { raw: raw, familyId: familyId }];
            }
        });
    });
}
function publicUser(user) {
    var _a, _b;
    var subscription = user.subscription;
    var trialExpired = subscription.status === "trialing" && subscription.trialEndsAt <= new Date();
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        organizationId: user.organizationId.toString(),
        teamId: (_b = (_a = user.teamId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : null,
        role: user.role,
        subscription: {
            plan: subscription.plan,
            status: trialExpired ? "trial_expired" : subscription.status,
            trialEndsAt: subscription.trialEndsAt,
            currentPeriodEnd: subscription.currentPeriodEnd,
            trialDaysLeft: trialExpired ? 0 : subscription.status === "trialing"
                ? Math.max(0, Math.ceil((subscription.trialEndsAt.getTime() - Date.now()) / 86400000))
                : 0,
        },
        settings: user.settings,
    };
}
function signup(input) {
    return __awaiter(this, void 0, void 0, function () {
        var ownerId, organization, team, user, _a, _b, error_1, refresh;
        var _c;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, User_1.User.exists({ email: input.email.toLowerCase() })];
                case 1:
                    if (_e.sent())
                        throw (0, errors_1.conflict)("An account with this email already exists", "EMAIL_IN_USE");
                    ownerId = new mongoose_1.Types.ObjectId();
                    return [4 /*yield*/, Organization_1.Organization.create({
                            name: ((_d = input.organizationName) === null || _d === void 0 ? void 0 : _d.trim()) || "".concat(input.name.trim(), "'s workspace"),
                            ownerId: ownerId,
                        })];
                case 2:
                    organization = _e.sent();
                    return [4 /*yield*/, Team_1.Team.create({ organizationId: organization._id, name: "General" })];
                case 3:
                    team = _e.sent();
                    _e.label = 4;
                case 4:
                    _e.trys.push([4, 7, , 10]);
                    _b = (_a = User_1.User).create;
                    _c = {
                        _id: ownerId,
                        organizationId: organization._id,
                        teamId: team._id,
                        name: input.name.trim(),
                        email: input.email.toLowerCase()
                    };
                    return [4 /*yield*/, bcryptjs_1.hash(input.password, BCRYPT_ROUNDS)];
                case 5: return [4 /*yield*/, _b.apply(_a, [(_c.passwordHash = _e.sent(),
                            _c.role = "admin",
                            _c.subscription = { plan: "Team", status: "trialing", trialEndsAt: new Date(Date.now() + 7 * 86400000) },
                            _c)])];
                case 6:
                    user = _e.sent();
                    return [3 /*break*/, 10];
                case 7:
                    error_1 = _e.sent();
                    return [4 /*yield*/, Team_1.Team.deleteOne({ _id: team._id })];
                case 8:
                    _e.sent();
                    return [4 /*yield*/, Organization_1.Organization.deleteOne({ _id: organization._id })];
                case 9:
                    _e.sent();
                    throw error_1;
                case 10: return [4 /*yield*/, createRefreshToken(user._id)];
                case 11:
                    refresh = _e.sent();
                    return [2 /*return*/, { user: publicUser(user), accessToken: accessToken(user), refreshToken: refresh.raw }];
            }
        });
    });
}
function signin(input) {
    return __awaiter(this, void 0, void 0, function () {
        var user, _a, refresh;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, User_1.User.findOne({ email: input.email.toLowerCase() }).select("+passwordHash")];
                case 1:
                    user = _b.sent();
                    _a = !user;
                    if (_a) return [3 /*break*/, 3];
                    return [4 /*yield*/, bcryptjs_1.compare(input.password, user.passwordHash)];
                case 2:
                    _a = !(_b.sent());
                    _b.label = 3;
                case 3:
                    if (_a)
                        throw (0, errors_1.unauthorized)("Email or password is incorrect");
                    if (!(user.subscription.status === "trialing" && user.subscription.trialEndsAt <= new Date())) return [3 /*break*/, 5];
                    user.subscription.status = "trial_expired";
                    return [4 /*yield*/, user.save()];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5: return [4 /*yield*/, createRefreshToken(user._id)];
                case 6:
                    refresh = _b.sent();
                    return [2 /*return*/, { user: publicUser(user), accessToken: accessToken(user), refreshToken: refresh.raw }];
            }
        });
    });
}
function acceptInvitation(input) {
    return __awaiter(this, void 0, void 0, function () {
        var tokenHash, now, invitation, organization, owner, _a, user, _b, _c, refresh, error_2;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    tokenHash = hashRefreshToken(input.token);
                    now = new Date();
                    return [4 /*yield*/, Invitation_1.Invitation.findOneAndUpdate({ tokenHash: tokenHash, email: input.email.toLowerCase(), acceptedAt: null, expiresAt: { $gt: now } }, { $set: { acceptedAt: now } }, { new: false })];
                case 1:
                    invitation = _e.sent();
                    if (!invitation)
                        throw (0, errors_1.unauthorized)("Invitation is invalid or expired");
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 11, , 13]);
                    return [4 /*yield*/, User_1.User.exists({ email: input.email.toLowerCase() })];
                case 3:
                    if (_e.sent()) {
                        throw (0, errors_1.conflict)("An account with this email already exists", "EMAIL_IN_USE");
                    }
                    return [4 /*yield*/, Organization_1.Organization.findById(invitation.organizationId).select("ownerId")];
                case 4:
                    organization = _e.sent();
                    if (!organization) return [3 /*break*/, 6];
                    return [4 /*yield*/, User_1.User.findById(organization.ownerId)];
                case 5:
                    _a = _e.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _a = null;
                    _e.label = 7;
                case 7:
                    owner = _a;
                    if (!owner)
                        throw (0, errors_1.unauthorized)("Workspace owner account is unavailable");
                    _c = (_b = User_1.User).create;
                    _d = {
                        organizationId: invitation.organizationId,
                        teamId: invitation.teamId,
                        name: input.name.trim(),
                        email: input.email.toLowerCase()
                    };
                    return [4 /*yield*/, bcryptjs_1.hash(input.password, BCRYPT_ROUNDS)];
                case 8: return [4 /*yield*/, _c.apply(_b, [(_d.passwordHash = _e.sent(),
                            _d.role = "employee",
                            _d.subscription = owner.subscription.toObject(),
                            _d)])];
                case 9:
                    user = _e.sent();
                    return [4 /*yield*/, createRefreshToken(user._id)];
                case 10:
                    refresh = _e.sent();
                    return [2 /*return*/, { user: publicUser(user), accessToken: accessToken(user), refreshToken: refresh.raw }];
                case 11:
                    error_2 = _e.sent();
                    return [4 /*yield*/, Invitation_1.Invitation.updateOne({ _id: invitation._id, acceptedAt: now }, { $set: { acceptedAt: null } })];
                case 12:
                    _e.sent();
                    throw error_2;
                case 13: return [2 /*return*/];
            }
        });
    });
}
function rotateRefreshToken(raw) {
    return __awaiter(this, void 0, void 0, function () {
        var old, replacement, result, replacementDoc, user, expired;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!raw || raw.length < 40)
                        throw (0, errors_1.unauthorized)("Refresh token is invalid");
                    return [4 /*yield*/, RefreshToken_1.RefreshToken.findOne({ tokenHash: hashRefreshToken(raw) }).select("+tokenHash")];
                case 1:
                    old = _b.sent();
                    if (!old)
                        throw (0, errors_1.unauthorized)("Refresh token is invalid");
                    if (!(old.revokedAt || old.expiresAt <= new Date())) return [3 /*break*/, 3];
                    return [4 /*yield*/, RefreshToken_1.RefreshToken.updateMany({ familyId: old.familyId, revokedAt: null }, { revokedAt: new Date() })];
                case 2:
                    _b.sent();
                    throw (0, errors_1.unauthorized)(old.revokedAt ? "Refresh token reuse detected" : "Refresh token has expired");
                case 3: return [4 /*yield*/, createRefreshToken(old.userId, old.familyId)];
                case 4:
                    replacement = _b.sent();
                    return [4 /*yield*/, RefreshToken_1.RefreshToken.updateOne({ _id: old._id, revokedAt: null }, { $set: { revokedAt: new Date() } })];
                case 5:
                    result = _b.sent();
                    if (!!result.modifiedCount) return [3 /*break*/, 8];
                    return [4 /*yield*/, RefreshToken_1.RefreshToken.updateMany({ familyId: old.familyId, revokedAt: null }, { revokedAt: new Date() })];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, RefreshToken_1.RefreshToken.deleteOne({ tokenHash: hashRefreshToken(replacement.raw) })];
                case 7:
                    _b.sent();
                    throw (0, errors_1.unauthorized)("Refresh token reuse detected");
                case 8: return [4 /*yield*/, RefreshToken_1.RefreshToken.findOne({ tokenHash: hashRefreshToken(replacement.raw) }).select("_id")];
                case 9:
                    replacementDoc = _b.sent();
                    old.replacedByTokenId = (_a = replacementDoc === null || replacementDoc === void 0 ? void 0 : replacementDoc._id) !== null && _a !== void 0 ? _a : null;
                    return [4 /*yield*/, old.save()];
                case 10:
                    _b.sent();
                    return [4 /*yield*/, User_1.User.findById(old.userId)];
                case 11:
                    user = _b.sent();
                    if (!user)
                        throw (0, errors_1.unauthorized)();
                    expired = user.subscription.status === "trialing" && user.subscription.trialEndsAt <= new Date();
                    if (!expired) return [3 /*break*/, 13];
                    user.subscription.status = "trial_expired";
                    return [4 /*yield*/, user.save()];
                case 12:
                    _b.sent();
                    _b.label = 13;
                case 13: return [2 /*return*/, { user: publicUser(user), accessToken: accessToken(user), refreshToken: replacement.raw }];
            }
        });
    });
}
function revokeRefreshToken(raw) {
    return __awaiter(this, void 0, void 0, function () {
        var tokenHash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!raw)
                        return [2 /*return*/];
                    tokenHash = hashRefreshToken(raw);
                    return [4 /*yield*/, RefreshToken_1.RefreshToken.updateOne({ tokenHash: tokenHash, revokedAt: null }, { revokedAt: new Date() })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function revokeAllRefreshTokens(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var now, active;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    now = new Date();
                    return [4 /*yield*/, RefreshToken_1.RefreshToken.find({ userId: userId, revokedAt: null }).select("familyId")];
                case 1:
                    active = _a.sent();
                    if (!active.length) return [3 /*break*/, 3];
                    return [4 /*yield*/, RefreshToken_1.RefreshToken.updateMany({ familyId: { $in: active.map(function (token) { return token.familyId; }) }, revokedAt: null }, { revokedAt: now })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getCurrentUser(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, User_1.User.findById(userId)];
                case 1:
                    user = _a.sent();
                    if (!user)
                        throw (0, errors_1.unauthorized)();
                    if (!(user.subscription.status === "trialing" && user.subscription.trialEndsAt <= new Date())) return [3 /*break*/, 3];
                    user.subscription.status = "trial_expired";
                    return [4 /*yield*/, user.save()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/, publicUser(user)];
            }
        });
    });
}
