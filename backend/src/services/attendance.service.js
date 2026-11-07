"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIn = checkIn;
exports.checkOut = checkOut;
exports.myAttendance = myAttendance;
exports.adminAttendance = adminAttendance;
exports.exportAttendanceCsv = exportAttendanceCsv;
const Attendance_1 = require("../models/Attendance");
const errors_1 = require("../utils/errors");

async function checkIn(user) {
    if (await Attendance_1.Attendance.exists({ userId: user.userId, checkedOutAt: null }))
        throw (0, errors_1.conflict)("You are already checked in", "ALREADY_CHECKED_IN");
    try {
        return await Attendance_1.Attendance.create({
            userId: user.userId,
            organizationId: user.organizationId,
            checkedInAt: new Date(),
        });
    }
    catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === 11000)
            throw (0, errors_1.conflict)("You are already checked in", "ALREADY_CHECKED_IN");
        throw error;
    }
}

async function checkOut(userId) {
    const open = await Attendance_1.Attendance.findOne({ userId, checkedOutAt: null }).select("_id checkedInAt");
    if (!open)
        throw (0, errors_1.conflict)("You are not currently checked in", "NOT_CHECKED_IN");
    const checkedOutAt = new Date();
    const durationSeconds = Math.max(0, Math.floor((checkedOutAt.getTime() - open.checkedInAt.getTime()) / 1000));
    const session = await Attendance_1.Attendance.findOneAndUpdate(
        { _id: open._id, checkedOutAt: null },
        { $set: { checkedOutAt, durationSeconds } },
        { new: true },
    );
    if (!session)
        throw (0, errors_1.conflict)("Attendance was already checked out", "NOT_CHECKED_IN");
    return session;
}

async function myAttendance(userId) {
    const from = new Date();
    from.setUTCDate(from.getUTCDate() - 30);
    const [current, records] = await Promise.all([
        Attendance_1.Attendance.findOne({ userId, checkedOutAt: null }).lean(),
        Attendance_1.Attendance.find({ userId, checkedInAt: { $gte: from } }).sort({ checkedInAt: -1 }).limit(50).lean(),
    ]);
    return { current, records };
}

function utcDay(date) {
    const start = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime()) || start.toISOString().slice(0, 10) !== date)
        throw (0, errors_1.badRequest)("Date must be a valid YYYY-MM-DD calendar date", "INVALID_DATE");
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { start, end };
}

async function adminAttendance(date, page = 1) {
    const { start, end } = utcDay(date);
    const now = new Date();
    const match = { checkedInAt: { $gte: start, $lt: end } };
    const [aggregate, records] = await Promise.all([
        Attendance_1.Attendance.aggregate([
            { $match: match },
            { $group: {
                _id: null,
                totalCheckIns: { $sum: 1 },
                currentlyCheckedIn: { $sum: { $cond: [{ $eq: ["$checkedOutAt", null] }, 1, 0] } },
                totalSeconds: { $sum: { $ifNull: ["$durationSeconds", { $floor: { $divide: [{ $subtract: [now, "$checkedInAt"] }, 1000] } }] } },
                employees: { $addToSet: "$userId" },
            } },
            { $project: { _id: 0, totalCheckIns: 1, currentlyCheckedIn: 1, totalSeconds: 1, employees: { $size: "$employees" } } },
        ]),
        Attendance_1.Attendance.find(match)
            .sort({ checkedInAt: -1 })
            .skip((page - 1) * 50)
            .limit(50)
            .populate({ path: "userId", select: "name email organizationId", populate: { path: "organizationId", select: "name" } })
            .lean(),
    ]);
    const total = await Attendance_1.Attendance.countDocuments(match);
    const rows = records.map((record) => ({
        id: record._id.toString(),
        employee: record.userId?.name ?? "Unknown employee",
        email: record.userId?.email ?? "",
        organization: record.userId?.organizationId?.name ?? "Unknown workspace",
        checkedInAt: record.checkedInAt,
        checkedOutAt: record.checkedOutAt,
        durationSeconds: record.durationSeconds ?? Math.max(0, Math.floor((now.getTime() - record.checkedInAt.getTime()) / 1000)),
    }));
    return {
        date,
        summary: aggregate[0] ?? { totalCheckIns: 0, currentlyCheckedIn: 0, totalSeconds: 0, employees: 0 },
        records: rows,
        page,
        total,
        totalPages: Math.ceil(total / 50),
    };
}

function csvCell(value) {
    const text = value == null ? "" : String(value);
    return `"${text.replaceAll("\"", "\"\"")}"`;
}

async function exportAttendanceCsv(date) {
    const { start, end } = utcDay(date);
    const records = await Attendance_1.Attendance.find({ checkedInAt: { $gte: start, $lt: end } })
        .sort({ checkedInAt: 1 })
        .populate({ path: "userId", select: "name email organizationId", populate: { path: "organizationId", select: "name" } })
        .lean();
    const rows = [["Employee", "Email", "Workspace", "Check-in (UTC)", "Check-out (UTC)", "Duration (seconds)"]];
    for (const record of records) {
        rows.push([
            record.userId?.name ?? "Unknown employee",
            record.userId?.email ?? "",
            record.userId?.organizationId?.name ?? "Unknown workspace",
            record.checkedInAt.toISOString(),
            record.checkedOutAt?.toISOString() ?? "",
            record.durationSeconds ?? Math.max(0, Math.floor((Date.now() - record.checkedInAt.getTime()) / 1000)),
        ]);
    }
    return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
