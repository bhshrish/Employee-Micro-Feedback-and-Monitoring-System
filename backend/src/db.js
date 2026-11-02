"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
async function connectDatabase() {
    await mongoose_1.default.connect((0, env_1.getConfig)().MONGODB_URI, {
        autoIndex: (0, env_1.getConfig)().NODE_ENV !== "production",
        serverSelectionTimeoutMS: 10_000,
    });
    if ((0, env_1.getConfig)().NODE_ENV === "production") {
        await Promise.all(mongoose_1.default.modelNames().map((name) => mongoose_1.default.model(name).createIndexes()));
    }
    logger_1.logger.info("MongoDB connected");
}
