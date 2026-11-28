"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthState = void 0;
const mongoose_1 = require("mongoose");
const oauthStateSchema = new mongoose_1.Schema({
    stateHash: { type: String, required: true, unique: true },
    provider: { type: String, enum: ["google"], required: true },
    nonce: { type: String, required: true },
    codeVerifier: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });
exports.OAuthState = mongoose_1.models.OAuthState || (0, mongoose_1.model)("OAuthState", oauthStateSchema);
