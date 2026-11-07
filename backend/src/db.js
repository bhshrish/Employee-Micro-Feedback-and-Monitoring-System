"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const { createHmac } = require("node:crypto");
const { getConfig: readConfig } = require("./config/env");

async function anonymizeLegacyPulseReceipts() {
    const config = readConfig();
    const collections = await mongoose_1.default.connection.db.listCollections({ name: "pulsereceipts" }).toArray();
    if (!collections.length)
        return;
    const collection = mongoose_1.default.connection.collection("pulsereceipts");
    const indexes = await collection.indexes();
    if (indexes.some((index) => index.name === "userId_1_weekStart_1"))
        await collection.dropIndex("userId_1_weekStart_1");
    const legacy = collection.find({ userId: { $exists: true }, submissionTokenHash: { $exists: false } });
    for await (const receipt of legacy) {
        const submissionTokenHash = createHmac("sha256", config.JWT_REFRESH_SECRET)
            .update(`${receipt.userId.toString()}:${new Date(receipt.weekStart).toISOString()}`)
            .digest("hex");
        await collection.updateOne(
            { _id: receipt._id },
            { $set: { submissionTokenHash }, $unset: { userId: "" } },
        );
    }
}

async function connectDatabase() {
    await mongoose_1.default.connect((0, env_1.getConfig)().MONGODB_URI, {
        autoIndex: false,
        serverSelectionTimeoutMS: 10_000,
    });
    await anonymizeLegacyPulseReceipts();
    await Promise.all(mongoose_1.default.modelNames().map((name) => mongoose_1.default.model(name).createIndexes()));
    logger_1.logger.info("MongoDB connected");
}
