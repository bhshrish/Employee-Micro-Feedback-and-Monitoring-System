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
exports.authenticate = authenticate;
exports.requireRole = requireRole;
exports.requireEntitlement = requireEntitlement;
exports.requirePlan = requirePlan;
var jsonwebtoken_1 = require("jsonwebtoken");
var mongoose_1 = require("mongoose");
var env_1 = require("../config/env");
var User_1 = require("../models/User");
var errors_1 = require("../utils/errors");
function authenticate(req, _res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var header, token, payload, user, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    header = req.get("authorization");
                    if (!(header === null || header === void 0 ? void 0 : header.startsWith("Bearer ")))
                        throw (0, errors_1.unauthorized)();
                    token = header.slice(7);
                    payload = jsonwebtoken_1.verify(token, (0, env_1.getConfig)().JWT_ACCESS_SECRET, {
                        issuer: "pulse-api",
                        audience: "pulse-client",
                    });
                    if (payload.typ !== "access" || !mongoose_1.Types.ObjectId.isValid(payload.sub))
                        throw (0, errors_1.unauthorized)();
                    return [4 /*yield*/, User_1.User.findById(payload.sub).select("organizationId teamId role subscription.status subscription.trialEndsAt")];
                case 1:
                    user = _a.sent();
                    if (!user)
                        throw (0, errors_1.unauthorized)();
                    req.auth = {
                        userId: user._id,
                        organizationId: user.organizationId,
                        teamId: user.teamId,
                        role: user.role,
                    };
                    next();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    next(error_1 instanceof Error && error_1.name === "TokenExpiredError" ? (0, errors_1.unauthorized)("Access token expired") : error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function requireRole() {
    var roles = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        roles[_i] = arguments[_i];
    }
    return function (req, _res, next) {
        if (!req.auth || !roles.includes(req.auth.role)) {
            next((0, errors_1.forbidden)());
            return;
        }
        next();
    };
}
function requireEntitlement(req, _res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var user, sub, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    if (!req.auth)
                        throw (0, errors_1.unauthorized)();
                    return [4 /*yield*/, User_1.User.findById(req.auth.userId).select("subscription.plan subscription.status subscription.trialEndsAt")];
                case 1:
                    user = _a.sent();
                    if (!user)
                        throw (0, errors_1.unauthorized)();
                    sub = user.subscription;
                    if (!(sub.status === "trialing" && sub.trialEndsAt <= new Date())) return [3 /*break*/, 3];
                    sub.status = "trial_expired";
                    return [4 /*yield*/, user.save()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    if (user.subscription.status === "trial_expired" || user.subscription.status === "canceled") {
                        next((0, errors_1.forbidden)("A current trial or subscription is required"));
                        return [2 /*return*/];
                    }
                    next();
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    next(error_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function requirePlan() {
    var _this = this;
    var plans = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        plans[_i] = arguments[_i];
    }
    return function (req, _res, next) { return __awaiter(_this, void 0, void 0, function () {
        var user, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    if (!req.auth)
                        throw (0, errors_1.unauthorized)();
                    return [4 /*yield*/, User_1.User.findById(req.auth.userId).select("subscription.plan subscription.status subscription.trialEndsAt")];
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
                case 3:
                    if (user.subscription.status === "trial_expired" || user.subscription.status === "canceled") {
                        next((0, errors_1.forbidden)("A current trial or subscription is required"));
                        return [2 /*return*/];
                    }
                    if (!plans.includes(user.subscription.plan)) {
                        next((0, errors_1.forbidden)("This feature is not available on your current plan"));
                        return [2 /*return*/];
                    }
                    next();
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    next(error_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
}
