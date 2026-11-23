"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasActiveWorkspace = hasActiveWorkspace;
const Organization_1 = require("../models/Organization");
const User_1 = require("../models/User");
async function hasActiveWorkspace(user) {
    if (user.organizationId) {
        const activeOrganization = await Organization_1.Organization.exists({
            _id: user.organizationId,
            isActive: { $ne: false },
        });
        if (activeOrganization) {
            return true;
        }

        if (await Organization_1.Organization.exists({ _id: user.organizationId })) {
            return false;
        }
    }

    const legacyUser = await User_1.User.collection.findOne(
        { _id: user._id },
        { projection: { orgId: 1, organizationId: 1 } },
    );
    const legacyOrganizationId = legacyUser?.orgId;
    if (!legacyOrganizationId || !await Organization_1.Organization.exists({
        _id: legacyOrganizationId,
        isActive: { $ne: false },
    })) {
        return false;
    }

    const currentOrganizationFilter = legacyUser.organizationId === undefined
        ? { organizationId: { $exists: false } }
        : { organizationId: legacyUser.organizationId };
    const repaired = await User_1.User.collection.updateOne(
        { _id: user._id, orgId: legacyOrganizationId, ...currentOrganizationFilter },
        { $set: { organizationId: legacyOrganizationId } },
    );
    if (!repaired.matchedCount) {
        const latestUser = await User_1.User.collection.findOne(
            { _id: user._id },
            { projection: { organizationId: 1 } },
        );
        if (!latestUser?.organizationId || !await Organization_1.Organization.exists({
            _id: latestUser.organizationId,
            isActive: { $ne: false },
        })) {
            return false;
        }
        user.organizationId = latestUser.organizationId;
        return true;
    }

    user.organizationId = legacyOrganizationId;
    return true;
}
