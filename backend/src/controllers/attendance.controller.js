"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const async_handler_1 = require("../utils/async-handler");
const errors_1 = require("../utils/errors");
const attendance_service_1 = require("../services/attendance.service");

exports.current = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    res.json(await (0, attendance_service_1.myAttendance)(req.auth.userId));
});
exports.checkIn = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    res.status(201).json({ attendance: await (0, attendance_service_1.checkIn)(req.auth) });
});
exports.checkOut = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    res.json({ attendance: await (0, attendance_service_1.checkOut)(req.auth.userId) });
});
