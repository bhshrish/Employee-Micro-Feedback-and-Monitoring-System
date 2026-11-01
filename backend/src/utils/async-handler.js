"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
var asyncHandler = function (handler) {
    return function (req, res, next) {
        void handler(req, res, next).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
