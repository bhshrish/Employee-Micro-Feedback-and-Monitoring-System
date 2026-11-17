"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.current = exports.checkIn = exports.checkOut = void 0;
const async_handler_1 = require("../utils/async-handler");
const errors_1 = require("../utils/errors");
const Attendance_1 = require("../models/Attendance");
exports.current = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const from = new Date();
    from.setUTCDate(from.getUTCDate() - 30);
    const [current, records] = await Promise.all([
        Attendance_1.Attendance.findOne({ userId: req.auth.userId, checkedOutAt: null }).lean(),
        Attendance_1.Attendance.find({ userId: req.auth.userId, checkedInAt: { $gte: from } }).sort({ checkedInAt: -1 }).limit(50).lean(),
    ]);
    res.json({ current, records });
});
exports.checkIn = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    if (await Attendance_1.Attendance.exists({ userId: req.auth.userId, checkedOutAt: null }))
        throw (0, errors_1.conflict)("You are already checked in", "ALREADY_CHECKED_IN");
    try {
        const attendance = await Attendance_1.Attendance.create({
            userId: req.auth.userId,
            organizationId: req.auth.organizationId,
            checkedInAt: new Date(),
        });
        res.status(201).json({ attendance });
    }
    catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === 11000)
            throw (0, errors_1.conflict)("You are already checked in", "ALREADY_CHECKED_IN");
        throw error;
    }
});
exports.checkOut = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const open = await Attendance_1.Attendance.findOne({ userId: req.auth.userId, checkedOutAt: null }).select("_id checkedInAt");
    if (!open)
        throw (0, errors_1.conflict)("You are not currently checked in", "NOT_CHECKED_IN");
    const checkedOutAt = new Date();
    const attendance = await Attendance_1.Attendance.findOneAndUpdate(
        { _id: open._id, checkedOutAt: null },
        { $set: { checkedOutAt, durationSeconds: Math.max(0, Math.floor((checkedOutAt.getTime() - open.checkedInAt.getTime()) / 1000)) } },
        { new: true },
    );
    if (!attendance)
        throw (0, errors_1.conflict)("Attendance was already checked out", "NOT_CHECKED_IN");
    res.json({ attendance });
});