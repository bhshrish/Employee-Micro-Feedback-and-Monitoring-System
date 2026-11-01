"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRequired = exports.conflict = exports.notFound = exports.forbidden = exports.unauthorized = exports.badRequest = exports.AppError = void 0;
var AppError = /** @class */ (function (_super) {
    __extends(AppError, _super);
    function AppError(statusCode, message, code, details) {
        if (code === void 0) { code = "REQUEST_ERROR"; }
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        _this.code = code;
        _this.details = details;
        _this.name = "AppError";
        return _this;
    }
    return AppError;
}(Error));
exports.AppError = AppError;
var badRequest = function (message, code) { return new AppError(400, message, code); };
exports.badRequest = badRequest;
var unauthorized = function (message) {
    if (message === void 0) { message = "Authentication required"; }
    return new AppError(401, message, "UNAUTHORIZED");
};
exports.unauthorized = unauthorized;
var forbidden = function (message) {
    if (message === void 0) { message = "You do not have permission to perform this action"; }
    return new AppError(403, message, "FORBIDDEN");
};
exports.forbidden = forbidden;
var notFound = function (message) {
    if (message === void 0) { message = "Resource not found"; }
    return new AppError(404, message, "NOT_FOUND");
};
exports.notFound = notFound;
var conflict = function (message, code) {
    if (code === void 0) { code = "CONFLICT"; }
    return new AppError(409, message, code);
};
exports.conflict = conflict;
var paymentRequired = function (message) {
    if (message === void 0) { message = "An active subscription is required"; }
    return new AppError(402, message, "SUBSCRIPTION_REQUIRED");
};
exports.paymentRequired = paymentRequired;
