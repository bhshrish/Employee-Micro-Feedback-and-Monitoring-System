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
exports.webhook = exports.portalSession = exports.currentSubscription = exports.availablePlans = exports.listInvoices = exports.cancel = exports.checkout = void 0;
var async_handler_1 = require("../utils/async-handler");
var billing_service_1 = require("../services/billing.service");
var http_1 = require("../utils/http");
var errors_1 = require("../utils/errors");
var billing_service_2 = require("../services/billing.service");
exports.checkout = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, billing_service_1.createCheckout)(req.auth.userId, req.body.plan, req.body.cycle)];
            case 2:
                result = _a.sent();
                res.status(201).json(__assign(__assign({}, result), { data: result }));
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                if (error_1 instanceof Error && /not configured/.test(error_1.message))
                    throw (0, http_1.unavailable)(error_1.message);
                throw error_1;
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.cancel = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                _b = (_a = res).json;
                return [4 /*yield*/, (0, billing_service_1.cancelSubscription)(req.auth.userId)];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
exports.listInvoices = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, error_2;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                _d.label = 1;
            case 1:
                _d.trys.push([1, 3, , 4]);
                _b = (_a = res).json;
                _c = {};
                return [4 /*yield*/, (0, billing_service_1.invoices)(req.auth.userId)];
            case 2:
                _b.apply(_a, [(_c.invoices = _d.sent(), _c)]);
                return [3 /*break*/, 4];
            case 3:
                error_2 = _d.sent();
                if (error_2 instanceof Error && /not configured/.test(error_2.message))
                    throw (0, http_1.unavailable)(error_2.message);
                throw error_2;
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.availablePlans = (0, async_handler_1.asyncHandler)(function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.json({ plans: (0, billing_service_2.plans)() });
        return [2 /*return*/];
    });
}); });
exports.currentSubscription = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                _b = (_a = res).json;
                _c = {};
                return [4 /*yield*/, (0, billing_service_2.subscription)(req.auth.userId)];
            case 1:
                _b.apply(_a, [(_c.subscription = _d.sent(), _c)]);
                return [2 /*return*/];
        }
    });
}); });
exports.portalSession = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, error_3;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                _b = (_a = res.status(201)).json;
                return [4 /*yield*/, (0, billing_service_2.createPortalSession)(req.auth.userId)];
            case 2:
                _b.apply(_a, [_c.sent()]);
                return [3 /*break*/, 4];
            case 3:
                error_3 = _c.sent();
                if (error_3 instanceof Error && /not configured/.test(error_3.message))
                    throw (0, http_1.unavailable)(error_3.message);
                throw error_3;
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.webhook = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var event, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                try {
                    event = (0, billing_service_1.verifyStripeSignature)(req.body, req.get("stripe-signature"));
                }
                catch (error) {
                    if (error instanceof Error && /not configured/.test(error.message))
                        throw (0, http_1.unavailable)(error.message);
                    throw error;
                }
                return [4 /*yield*/, (0, billing_service_1.processStripeEvent)(event)];
            case 1:
                result = _a.sent();
                res.json({ received: true, duplicate: result.duplicate });
                return [2 /*return*/];
        }
    });
}); });
