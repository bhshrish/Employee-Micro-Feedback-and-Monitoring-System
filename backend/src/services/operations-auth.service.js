"use strict";
const bcrypt = require("bcryptjs");
const { getConfig } = require("../config/env");
const { OperationsAdmin } = require("../models/OperationsAdmin");
const { unauthorized, AppError } = require("../utils/errors");

const ADMIN_ID = "platform-admin";
const BCRYPT_ROUNDS = 12;

async function getOperationsAdmin() {
    const config = getConfig();
    let admin = await OperationsAdmin.findById(ADMIN_ID).select("+passwordHash");
    if (!admin) {
        if (!config.OPS_ADMIN_INITIAL_PASSWORD)
            throw new AppError(503, "Configure OPS_ADMIN_INITIAL_PASSWORD to initialize the platform administrator.", "ADMIN_SETUP_REQUIRED");
        try {
            admin = await OperationsAdmin.create({
                _id: ADMIN_ID,
                name: config.OPS_ADMIN_NAME,
                email: config.OPS_ADMIN_EMAIL.toLowerCase(),
                passwordHash: await bcrypt.hash(config.OPS_ADMIN_INITIAL_PASSWORD, BCRYPT_ROUNDS),
                passwordChangedAt: new Date(),
            });
        }
        catch (error) {
            if (error?.code !== 11000)
                throw error;
            admin = await OperationsAdmin.findById(ADMIN_ID).select("+passwordHash");
            if (!admin)
                throw error;
        }
    }
    if (admin.email !== config.OPS_ADMIN_EMAIL.toLowerCase() || admin.name !== config.OPS_ADMIN_NAME) {
        admin.email = config.OPS_ADMIN_EMAIL.toLowerCase();
        admin.name = config.OPS_ADMIN_NAME;
        await admin.save();
    }
    return admin;
}

async function signInOperationsAdmin({ email, password }) {
    const config = getConfig();
    if (email.trim().toLowerCase() !== config.OPS_ADMIN_EMAIL.toLowerCase())
        throw unauthorized("Email or password is incorrect");
    const admin = await getOperationsAdmin();
    if (!(await bcrypt.compare(password, admin.passwordHash)))
        throw unauthorized("Email or password is incorrect");
    return admin;
}

async function getOperationsAdminProfile() {
    const admin = await getOperationsAdmin();
    return { name: admin.name, email: admin.email, username: "admin" };
}

module.exports = { getOperationsAdmin, getOperationsAdminProfile, signInOperationsAdmin };
