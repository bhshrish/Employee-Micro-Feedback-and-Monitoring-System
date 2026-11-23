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

    }

    const storedUser = await User_1.User.collection.findOne(
        { _id: user._id },
        { projection: { orgId: 1, organizationId: 1 } },
    );
    const legacyOrganization = storedUser?.orgId
        ? await Organization_1.Organization.findOne({
            _id: storedUser.orgId,
            isActive: { $ne: false },
        }).select("_id")
        : null;
    const ownedOrganization = legacyOrganization
        ? null
        : await Organization_1.Organization.findOne({
            ownerId: user._id,
            isActive: { $ne: false },
            ...(user.organizationId ? { _id: { $ne: user.organizationId } } : {}),
        }).select("_id");
    const organizationId = legacyOrganization?._id ?? ownedOrganization?._id;
    if (!storedUser || !organizationId) {
        return false;
    }

    const currentOrganizationFilter = storedUser.organizationId === undefined
        ? { organizationId: { $exists: false } }
        : { organizationId: storedUser.organizationId };
    const repaired = await User_1.User.collection.updateOne(
        {
            _id: user._id,
            ...(storedUser.orgId === undefined ? { orgId: { $exists: false } } : { orgId: storedUser.orgId }),
            ...currentOrganizationFilter,
        },
        { $set: { organizationId } },
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

    user.organizationId = organizationId;
    return true;
}
