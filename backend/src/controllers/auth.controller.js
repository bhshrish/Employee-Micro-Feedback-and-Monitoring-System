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
exports.updateProfile = exports.me = exports.logoutEverywhere = exports.logout = exports.refresh = exports.acceptInvitation = exports.signin = exports.signup = void 0;
var env_1 = require("../config/env");
var auth = require("../services/auth.service");
var async_handler_1 = require("../utils/async-handler");
var errors_1 = require("../utils/errors");
var cookieName = "pulse_refresh";
function cookieOptions() {
    var config = (0, env_1.getConfig)();
    return __assign(__assign({ httpOnly: true, secure: config.COOKIE_SECURE || config.NODE_ENV === "production", sameSite: "lax", path: "/api/v1/auth" }, (config.COOKIE_DOMAIN ? { domain: config.COOKIE_DOMAIN } : {})), { maxAge: config.REFRESH_TOKEN_DAYS * 86400000 });
}
function setSession(res, result, statusCode) {
    if (statusCode === void 0) { statusCode = 200; }
    res.cookie(cookieName, result.refreshToken, cookieOptions());
    res.setHeader("Cache-Control", "no-store");
    res.status(statusCode).json({ user: result.user, accessToken: result.accessToken, tokenType: "Bearer" });
}
exports.signup = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
    switch (_c.label) {
        case 0:
            _a = setSession;
            _b = [res];
            return [4 /*yield*/, auth.signup(req.body)];
        case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([_c.sent(), 201]))];
    }
}); }); });
exports.signin = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
    switch (_c.label) {
        case 0:
            _a = setSession;
            _b = [res];
            return [4 /*yield*/, auth.signin(req.body)];
        case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([_c.sent()]))];
    }
}); }); });
exports.acceptInvitation = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () { var _a, _b; return __generator(this, function (_c) {
    switch (_c.label) {
        case 0:
            _a = setSession;
            _b = [res];
            return [4 /*yield*/, auth.acceptInvitation(req.body)];
        case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([_c.sent(), 201]))];
    }
}); }); });
exports.refresh = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var raw, _a, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                raw = (_c = req.cookies) === null || _c === void 0 ? void 0 : _c[cookieName];
                if (!raw)
                    throw (0, errors_1.unauthorized)("Refresh cookie is required");
                _a = setSession;
                _b = [res];
                return [4 /*yield*/, auth.rotateRefreshToken(raw)];
            case 1:
                _a.apply(void 0, _b.concat([_d.sent()]));
                return [2 /*return*/];
        }
    });
}); });
exports.logout = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, auth.revokeRefreshToken((_a = req.cookies) === null || _a === void 0 ? void 0 : _a[cookieName])];
            case 1:
                _b.sent();
                res.clearCookie(cookieName, __assign(__assign({}, cookieOptions()), { maxAge: undefined }));
                res.status(204).end();
                return [2 /*return*/];
        }
    });
}); });
exports.logoutEverywhere = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                return [4 /*yield*/, auth.revokeAllRefreshTokens(req.auth.userId)];
            case 1:
                _a.sent();
                res.clearCookie(cookieName, __assign(__assign({}, cookieOptions()), { maxAge: undefined }));
                res.status(204).end();
                return [2 /*return*/];
        }
    });
}); });
exports.me = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                _b = (_a = res).json;
                _c = {};
                return [4 /*yield*/, auth.getCurrentUser(req.auth.userId)];
            case 1:
                _b.apply(_a, [(_c.user = _d.sent(), _c)]);
                return [2 /*return*/];
        }
    });
}); });
exports.updateProfile = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var User, update, _i, _a, _b, key, value, user, _c, _d;
    var _e;
    var _f, _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                return [4 /*yield*/, Promise.resolve().then(function () { return require("../models/User"); })];
            case 1:
                User = (_j.sent()).User;
                update = {};
                if (req.body.name !== undefined)
                    update.name = req.body.name;
                if (((_f = req.body.settings) === null || _f === void 0 ? void 0 : _f.idleThresholdMinutes) !== undefined)
                    update["settings.idleThresholdMinutes"] = req.body.settings.idleThresholdMinutes;
                for (_i = 0, _a = Object.entries((_h = (_g = req.body.settings) === null || _g === void 0 ? void 0 : _g.notifications) !== null && _h !== void 0 ? _h : {}); _i < _a.length; _i++) {
                    _b = _a[_i], key = _b[0], value = _b[1];
                    update["settings.notifications.".concat(key)] = value;
                }
                return [4 /*yield*/, User.findOneAndUpdate({ _id: req.auth.userId, organizationId: req.auth.organizationId }, { $set: update }, { new: true, runValidators: true })];
            case 2:
                user = _j.sent();
                if (!user)
                    throw (0, errors_1.unauthorized)();
                _d = (_c = res).json;
                _e = {};
                return [4 /*yield*/, auth.getCurrentUser(user._id)];
            case 3:
                _d.apply(_c, [(_e.user = _j.sent(), _e)]);
                return [2 /*return*/];
        }
    });
}); });
