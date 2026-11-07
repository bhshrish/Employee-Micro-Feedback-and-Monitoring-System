"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminEmail = void 0;
exports.verifyAdminCredentials = verifyAdminCredentials;
exports.operationsOverview = operationsOverview;
exports.listBusinesses = listBusinesses;
exports.setBusinessActive = setBusinessActive;
exports.listUsers = listUsers;
exports.setUserActive = setUserActive;
exports.listTeams = listTeams;
exports.createTeam = createTeam;
exports.archiveTeam = archiveTeam;
exports.assignUserTeam = assignUserTeam;
exports.activitySummary = activitySummary;
exports.attendanceDashboard = attendanceDashboard;
exports.attendanceCsv = attendanceCsv;
const node_crypto_1 = require("node:crypto");
const mongoose_1 = require("mongoose");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const Organization_1 = require("../models/Organization");
const User_1 = require("../models/User");
const Team_1 = require("../models/Team");
const TeamActivity_1 = require("../models/TeamActivity");
const Attendance_1 = require("../models/Attendance");
const RefreshToken_1 = require("../models/RefreshToken");
exports.adminEmail = "admin@gmail.com";
const adminUsername = "admin";

function fixedTimeEqual(left, right) {
    const leftHash = (0, node_crypto_1.createHash)("sha256").update(left).digest();
    const rightHash = (0, node_crypto_1.createHash)("sha256").update(right).digest();
    return (0, node_crypto_1.timingSafeEqual)(leftHash, rightHash);
}

function verifyAdminCredentials(username, email, password) {
    const expected = (0, env_1.getConfig)().OPS_ADMIN_PASSWORD;
    if (!expected || expected.length < 12)
        throw new errors_1.AppError(503, "Operations admin access is not configured with a password of at least 12 characters.", "ADMIN_UNAVAILABLE");
    const validUsername = fixedTimeEqual(username, adminUsername);
    const validEmail = fixedTimeEqual(email, exports.adminEmail);
    const validPassword = fixedTimeEqual(password, expected);
    const valid = validUsername & validEmail & validPassword;
    if (!valid)
        throw (0, errors_1.unauthorized)("Admin username, email, or password is incorrect");
}

async function operationsOverview() {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 86_400_000);
    const [businesses, activeBusinesses, users, activeUsers, employees, openAttendance, activity] = await Promise.all([
        Organization_1.Organization.countDocuments({}),
        Organization_1.Organization.countDocuments({ isActive: { $ne: false } }),
        User_1.User.countDocuments({}),
        User_1.User.countDocuments({ isActive: { $ne: false } }),
        User_1.User.countDocuments({ role: "employee", isActive: { $ne: false } }),
        Attendance_1.Attendance.countDocuments({ checkedOutAt: null }),
        TeamActivity_1.TeamActivity.aggregate([
            { $match: { startedAt: { $gte: start, $lt: end } } },
            { $group: { _id: null, sessions: { $sum: 1 }, activeSeconds: { $sum: "$activeSeconds" }, idleSeconds: { $sum: "$idleSeconds" } } },
        ]),
    ]);
    return {
        businesses,
        activeBusinesses,
        users,
        activeUsers,
        employees,
        openAttendance,
        todayActivity: activity[0] ?? { sessions: 0, activeSeconds: 0, idleSeconds: 0 },
    };
}

function escapeRegex(value) {
    return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

async function listBusinesses({ page, q }) {
    const match = q ? { name: escapeRegex(q) } : {};
    return Organization_1.Organization.aggregate([
        { $match: match },
        { $lookup: { from: "users", let: { ownerId: "$ownerId" }, pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$ownerId"] } } }, { $project: { name: 1, email: 1, isActive: 1 } }], as: "owner" } },
        { $lookup: { from: "users", let: { organizationId: "$_id" }, pipeline: [{ $match: { $expr: { $eq: ["$organizationId", "$$organizationId"] } } }, { $count: "count" }], as: "userCount" } },
        { $lookup: { from: "teams", let: { organizationId: "$_id" }, pipeline: [{ $match: { $expr: { $eq: ["$organizationId", "$$organizationId"] }, archivedAt: null } }, { $count: "count" }], as: "teamCount" } },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * 50 },
        { $limit: 50 },
        { $project: { name: 1, isActive: { $ifNull: ["$isActive", true] }, createdAt: 1, owner: { $first: "$owner" }, users: { $ifNull: [{ $first: "$userCount.count" }, 0] }, teams: { $ifNull: [{ $first: "$teamCount.count" }, 0] } } },
    ]);
}

async function setBusinessActive(id, isActive) {
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw (0, errors_1.notFound)("Business not found");
    const business = await Organization_1.Organization.findByIdAndUpdate(id, { $set: { isActive } }, { new: true }).select("name isActive");
    if (!business)
        throw (0, errors_1.notFound)("Business not found");
    return business;
}

async function listUsers({ page, q, role }) {
    const filter = {};
    if (role)
        filter.role = role;
    if (q) {
        const search = escapeRegex(q);
        filter.$or = [{ name: search }, { email: search }];
    }
    const [users, total] = await Promise.all([
        User_1.User.find(filter).select("name email role isActive organizationId teamId createdAt")
            .populate("organizationId", "name isActive").populate("teamId", "name")
            .sort({ createdAt: -1 }).skip((page - 1) * 50).limit(50).lean(),
        User_1.User.countDocuments(filter),
    ]);
    return { users: users.map((user) => ({ ...user, isActive: user.isActive !== false })), total, page, totalPages: Math.ceil(total / 50) };
}

async function setUserActive(id, isActive) {
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw (0, errors_1.notFound)("User not found");
    const user = await User_1.User.findByIdAndUpdate(id, { $set: { isActive } }, { new: true })
        .select("name email role isActive organizationId teamId")
        .populate("organizationId", "name").populate("teamId", "name");
    if (!user)
        throw (0, errors_1.notFound)("User not found");
    if (!isActive)
        await RefreshToken_1.RefreshToken.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
    return user;
}

async function listTeams() {
    return Team_1.Team.find({ archivedAt: null }).populate("organizationId", "name isActive").sort({ name: 1 }).lean();
}

async function createTeam(organizationId, name) {
    if (!mongoose_1.Types.ObjectId.isValid(organizationId) || !await Organization_1.Organization.exists({ _id: organizationId, isActive: { $ne: false } }))
        throw (0, errors_1.notFound)("Active business not found");
    return Team_1.Team.create({ organizationId, name });
}

async function archiveTeam(id) {
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw (0, errors_1.notFound)("Team not found");
    const team = await Team_1.Team.findOne({ _id: id, archivedAt: null });
    if (!team)
        throw (0, errors_1.notFound)("Team not found");
    if (await User_1.User.exists({ organizationId: team.organizationId, teamId: team._id }))
        throw (0, errors_1.badRequest)("Reassign team members before archiving this team");
    team.archivedAt = new Date();
    await team.save();
    return team;
}

async function assignUserTeam(userId, teamId) {
    if (!mongoose_1.Types.ObjectId.isValid(userId))
        throw (0, errors_1.notFound)("User not found");
    const user = await User_1.User.findById(userId).select("organizationId");
    if (!user)
        throw (0, errors_1.notFound)("User not found");
    if (teamId !== null && (!mongoose_1.Types.ObjectId.isValid(teamId) ||
        !await Team_1.Team.exists({ _id: teamId, organizationId: user.organizationId, archivedAt: null }))) {
        throw (0, errors_1.badRequest)("Team must be active and belong to the user's business");
    }
    return User_1.User.findByIdAndUpdate(userId, { $set: { teamId } }, { new: true })
        .select("name email role isActive organizationId teamId")
        .populate("organizationId", "name").populate("teamId", "name");
}

function utcDay(date) {
    const start = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime()) || start.toISOString().slice(0, 10) !== date)
        throw (0, errors_1.badRequest)("Date must be a valid YYYY-MM-DD calendar date", "INVALID_DATE");
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { start, end };
}

async function activitySummary(date) {
    const { start, end } = utcDay(date);
    return TeamActivity_1.TeamActivity.aggregate([
        { $match: { startedAt: { $gte: start, $lt: end } } },
        { $group: { _id: "$organizationId", sessions: { $sum: 1 }, activeSeconds: { $sum: "$activeSeconds" }, idleSeconds: { $sum: "$idleSeconds" }, employees: { $addToSet: "$userId" } } },
        { $lookup: { from: "organizations", localField: "_id", foreignField: "_id", as: "business" } },
        { $project: { business: { $ifNull: [{ $first: "$business.name" }, "Unknown business"] }, sessions: 1, activeSeconds: 1, idleSeconds: 1, employees: { $size: "$employees" } } },
        { $sort: { business: 1 } },
    ]);
}

async function attendanceDashboard(date, page) {
    const { start, end } = utcDay(date);
    const now = new Date();
    const match = { checkedInAt: { $gte: start, $lt: end } };
    const [aggregate, records, total] = await Promise.all([
        Attendance_1.Attendance.aggregate([
            { $match: match },
            { $group: { _id: null, totalCheckIns: { $sum: 1 }, currentlyCheckedIn: { $sum: { $cond: [{ $eq: ["$checkedOutAt", null] }, 1, 0] } }, totalSeconds: { $sum: { $ifNull: ["$durationSeconds", { $floor: { $divide: [{ $subtract: [now, "$checkedInAt"] }, 1000] } }] } }, employees: { $addToSet: "$userId" } } },
            { $project: { _id: 0, totalCheckIns: 1, currentlyCheckedIn: 1, totalSeconds: 1, employees: { $size: "$employees" } } },
        ]),
        Attendance_1.Attendance.find(match).sort({ checkedInAt: -1 }).skip((page - 1) * 50).limit(50)
            .populate({ path: "userId", select: "name email organizationId", populate: { path: "organizationId", select: "name" } }).lean(),
        Attendance_1.Attendance.countDocuments(match),
    ]);
    return {
        date,
        summary: aggregate[0] ?? { totalCheckIns: 0, currentlyCheckedIn: 0, totalSeconds: 0, employees: 0 },
        records: records.map((record) => ({
            id: record._id.toString(),
            employee: record.userId?.name ?? "Unknown employee",
            email: record.userId?.email ?? "",
            business: record.userId?.organizationId?.name ?? "Unknown business",
            checkedInAt: record.checkedInAt,
            checkedOutAt: record.checkedOutAt,
            durationSeconds: record.durationSeconds ?? Math.max(0, Math.floor((now.getTime() - record.checkedInAt.getTime()) / 1000)),
        })),
        page,
        total,
        totalPages: Math.ceil(total / 50),
    };
}

function csvCell(value) {
    let text = value == null ? "" : String(value);
    if (/^[=+\-@\t\r]/.test(text))
        text = `'${text}`;
    return `"${text.replaceAll("\"", "\"\"")}"`;
}

async function attendanceCsv(date) {
    const { start, end } = utcDay(date);
    const records = await Attendance_1.Attendance.find({ checkedInAt: { $gte: start, $lt: end } })
        .sort({ checkedInAt: 1 })
        .populate({ path: "userId", select: "name email organizationId", populate: { path: "organizationId", select: "name" } }).lean();
    const rows = [["Employee", "Email", "Business", "Check-in (UTC)", "Check-out (UTC)", "Duration (seconds)"]];
    for (const record of records) {
        rows.push([
            record.userId?.name ?? "Unknown employee",
            record.userId?.email ?? "",
            record.userId?.organizationId?.name ?? "Unknown business",
            record.checkedInAt.toISOString(),
            record.checkedOutAt?.toISOString() ?? "",
            record.durationSeconds ?? Math.max(0, Math.floor((Date.now() - record.checkedInAt.getTime()) / 1000)),
        ]);
    }
    return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}