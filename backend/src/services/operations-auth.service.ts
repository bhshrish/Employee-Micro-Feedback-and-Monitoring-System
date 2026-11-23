const bcrypt = require("bcryptjs");
const { getConfig } = require("../config/env");
const { OperationsAdmin } = require("../models/OperationsAdmin");
const { unauthorized, AppError } = require("../utils/errors");

const ADMIN_ID = "platform-admin";

export async function getOperationsAdmin() {
    const config = getConfig();
    const admin = await OperationsAdmin.findById(ADMIN_ID).select("+passwordHash");
    if (!admin)
        throw new AppError(503, "Platform administrator is not seeded. Run `npm run seed:admin` from the backend directory.", "ADMIN_SETUP_REQUIRED");
    if (admin.email !== config.OPS_ADMIN_EMAIL.toLowerCase())
        throw new AppError(503, "The seeded platform administrator does not match OPS_ADMIN_EMAIL. Run `npm run seed:admin` after updating the environment.", "ADMIN_CONFIGURATION_MISMATCH");
    return admin;
}

export async function signInOperationsAdmin({ email, password }) {
    const config = getConfig();
    if (email.trim().toLowerCase() !== config.OPS_ADMIN_EMAIL.toLowerCase())
        throw unauthorized("Email or password is incorrect");
    const admin = await getOperationsAdmin();
    if (!(await bcrypt.compare(password, admin.passwordHash)))
        throw unauthorized("Email or password is incorrect");
    return admin;
}

export async function getOperationsAdminProfile() {
    const admin = await getOperationsAdmin();
    return { name: admin.name, email: admin.email, username: "admin" };
}

module.exports = { getOperationsAdmin, getOperationsAdminProfile, signInOperationsAdmin };
