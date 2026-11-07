"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminEmail = void 0;
exports.verifyAdminCredentials = verifyAdminCredentials;
exports.attendanceDashboard = attendanceDashboard;
exports.attendanceCsv = attendanceCsv;
const node_crypto_1 = require("node:crypto");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const attendance_service_1 = require("./attendance.service");
exports.adminEmail = "admin@gmail.com";

function fixedTimeEqual(left, right) {
    const leftHash = (0, node_crypto_1.createHash)("sha256").update(left).digest();
    const rightHash = (0, node_crypto_1.createHash)("sha256").update(right).digest();
    return (0, node_crypto_1.timingSafeEqual)(leftHash, rightHash);
}

function verifyAdminCredentials(email, password) {
    const config = (0, env_1.getConfig)();
    if (!config.OPS_ADMIN_PASSWORD)
        throw new errors_1.AppError(503, "Operations admin access is not configured.", "ADMIN_UNAVAILABLE");
    const validEmail = fixedTimeEqual(email, exports.adminEmail);
    const validPassword = fixedTimeEqual(password, config.OPS_ADMIN_PASSWORD);
    if (!validEmail || !validPassword)
        throw (0, errors_1.unauthorized)("Email or password is incorrect");
}

async function attendanceDashboard(date, page) {
    return (0, attendance_service_1.adminAttendance)(date, page);
}

async function attendanceCsv(date) {
    return (0, attendance_service_1.exportAttendanceCsv)(date);
}
