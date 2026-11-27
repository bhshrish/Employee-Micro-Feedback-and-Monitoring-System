"use strict";
const { createHash, createPublicKey, randomBytes, timingSafeEqual } = require("node:crypto");
const { isIP } = require("node:net");
const jwt = require("jsonwebtoken");
const { getConfig } = require("../config/env");
const { OAuthState } = require("../models/OAuthState");
const { AppError } = require("../utils/errors");
const auth = require("./auth.service");

const providerConfig = {
    google: {
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenEndpoint: "https://oauth2.googleapis.com/token",
        jwksEndpoint: "https://www.googleapis.com/oauth2/v3/certs",
        issuer: ["https://accounts.google.com", "accounts.google.com"],
    },
    apple: {
        authorizationEndpoint: "https://appleid.apple.com/auth/authorize",
        tokenEndpoint: "https://appleid.apple.com/auth/token",
        jwksEndpoint: "https://appleid.apple.com/auth/keys",
        issuer: ["https://appleid.apple.com"],
    },
};
const jwksCache = new Map();
const stateLifetimeMs = 10 * 60 * 1000;

function providerSettings(provider, config = getConfig()) {
    if (provider === "google") {
        const { GOOGLE_OAUTH_CLIENT_ID: clientId, GOOGLE_OAUTH_CLIENT_SECRET: clientSecret, GOOGLE_OAUTH_REDIRECT_URI: redirectUri } = config;
        if (!clientId || !clientSecret || !redirectUri)
            throw new AppError(503, "Google sign-in is not configured.", "OAUTH_NOT_CONFIGURED");
        validateRedirectUri(provider, redirectUri, config.NODE_ENV);
        return { ...providerConfig.google, clientId, clientSecret, redirectUri };
    }
    if (provider === "apple") {
        const { APPLE_OAUTH_CLIENT_ID: clientId, APPLE_OAUTH_TEAM_ID: teamId, APPLE_OAUTH_KEY_ID: keyId, APPLE_OAUTH_PRIVATE_KEY: privateKey, APPLE_OAUTH_REDIRECT_URI: redirectUri } = config;
        if (!clientId || !teamId || !keyId || !privateKey || !redirectUri)
            throw new AppError(503, "Apple sign-in is not configured.", "OAUTH_NOT_CONFIGURED");
        validateRedirectUri(provider, redirectUri, config.NODE_ENV);
        return { ...providerConfig.apple, clientId, teamId, keyId, privateKey, redirectUri };
    }
    throw new AppError(404, "Sign-in provider not found.", "OAUTH_PROVIDER_NOT_FOUND");
}

function validateRedirectUri(provider, redirectUri, nodeEnv) {
    const url = new URL(redirectUri);
    const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
    const isLocalHost = hostname === "localhost" || hostname.endsWith(".localhost") || isIP(hostname) !== 0;
    const usesLocalDevelopmentUrl = nodeEnv !== "production" && provider === "google" &&
        url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(hostname);
    if (url.pathname !== `/api/v1/auth/oauth/${provider}/callback` ||
        url.username || url.password || url.search || url.hash ||
        (provider === "apple" && (url.protocol !== "https:" || isLocalHost)) ||
        (url.protocol !== "https:" && !usesLocalDevelopmentUrl)) {
        throw new AppError(503, `${provider} sign-in callback URL is invalid.`, "OAUTH_NOT_CONFIGURED");
    }
}

function sha256(value) {
    return createHash("sha256").update(value).digest("base64url");
}

function hashState(value) {
    return createHash("sha256").update(value).digest("hex");
}

function appleClientSecret(settings) {
    const now = Math.floor(Date.now() / 1000);
    return jwt.sign(
        { iss: settings.teamId, iat: now, exp: now + 5 * 60, aud: "https://appleid.apple.com", sub: settings.clientId },
        settings.privateKey.replace(/\\n/g, "\n"),
        { algorithm: "ES256", keyid: settings.keyId },
    );
}

async function createAuthorizationUrl(provider) {
    const settings = providerSettings(provider);
    const state = randomBytes(32).toString("base64url");
    const nonce = randomBytes(32).toString("base64url");
    const codeVerifier = randomBytes(48).toString("base64url");
    await OAuthState.create({
        stateHash: hashState(state),
        provider,
        nonce,
        codeVerifier,
        expiresAt: new Date(Date.now() + stateLifetimeMs),
    });

    const url = new URL(settings.authorizationEndpoint);
    url.searchParams.set("client_id", settings.clientId);
    url.searchParams.set("redirect_uri", settings.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", provider === "google" ? "openid email profile" : "openid email");
    url.searchParams.set("state", state);
    url.searchParams.set("nonce", nonce);
    url.searchParams.set("code_challenge", sha256(codeVerifier));
    url.searchParams.set("code_challenge_method", "S256");
    if (provider === "apple")
        url.searchParams.set("response_mode", "query");
    return { authorizationUrl: url.toString(), state };
}

async function fetchJson(url, options) {
    let response;
    try {
        response = await fetch(url, { ...options, signal: AbortSignal.timeout(10_000) });
    } catch {
        throw new AppError(502, "The sign-in provider could not be reached. Please try again.", "OAUTH_PROVIDER_UNAVAILABLE");
    }
    if (!response.ok)
        throw new AppError(401, "The sign-in provider rejected the request.", "OAUTH_PROVIDER_REJECTED");
    return response.json();
}

async function getSigningKey(settings, kid) {
    const cacheKey = settings.jwksEndpoint;
    let cached = jwksCache.get(cacheKey);
    if (!cached || cached.expiresAt <= Date.now()) {
        const body = await fetchJson(settings.jwksEndpoint);
        if (!Array.isArray(body.keys))
            throw new AppError(502, "The sign-in provider returned invalid signing keys.", "OAUTH_INVALID_KEYS");
        cached = { keys: body.keys, expiresAt: Date.now() + 60 * 60 * 1000 };
        jwksCache.set(cacheKey, cached);
    }
    let key = cached.keys.find((candidate) => candidate.kid === kid && candidate.kty === "RSA");
    if (!key) {
        jwksCache.delete(cacheKey);
        const body = await fetchJson(settings.jwksEndpoint);
        if (!Array.isArray(body.keys))
            throw new AppError(502, "The sign-in provider returned invalid signing keys.", "OAUTH_INVALID_KEYS");
        key = body.keys.find((candidate) => candidate.kid === kid && candidate.kty === "RSA");
        jwksCache.set(cacheKey, { keys: body.keys, expiresAt: Date.now() + 60 * 60 * 1000 });
    }
    if (!key)
        throw new AppError(401, "The sign-in token could not be verified.", "OAUTH_INVALID_TOKEN");
    return createPublicKey({ key, format: "jwk" });
}

async function verifiedClaims(settings, idToken, expectedNonce) {
    if (typeof idToken !== "string" || idToken.length > 16_384)
        throw new AppError(401, "The sign-in token is invalid.", "OAUTH_INVALID_TOKEN");
    const header = jwt.decode(idToken, { complete: true })?.header;
    if (!header || header.alg !== "RS256" || typeof header.kid !== "string")
        throw new AppError(401, "The sign-in token is invalid.", "OAUTH_INVALID_TOKEN");
    const key = await getSigningKey(settings, header.kid);
    let claims;
    try {
        claims = jwt.verify(idToken, key, {
            algorithms: ["RS256"],
            audience: settings.clientId,
            issuer: settings.issuer,
            clockTolerance: 5,
        });
    } catch {
        throw new AppError(401, "The sign-in token could not be verified.", "OAUTH_INVALID_TOKEN");
    }
    const nonce = typeof claims === "object" && claims !== null ? claims.nonce : undefined;
    const nonceMatches = typeof nonce === "string" &&
        Buffer.byteLength(nonce) === Buffer.byteLength(expectedNonce) &&
        timingSafeEqual(Buffer.from(nonce), Buffer.from(expectedNonce));
    if (!nonceMatches || typeof claims !== "object" || claims === null ||
        typeof claims.sub !== "string" || claims.sub.length > 255) {
        throw new AppError(401, "The sign-in token could not be verified.", "OAUTH_INVALID_TOKEN");
    }
    if (claims.email !== undefined &&
        (typeof claims.email !== "string" ||
            !(claims.email_verified === true || claims.email_verified === "true"))) {
        throw new AppError(401, "The provider did not return a verified email address.", "OAUTH_EMAIL_UNVERIFIED");
    }
    return claims;
}

async function exchangeCode(provider, settings, code, codeVerifier) {
    const params = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: settings.redirectUri,
        client_id: settings.clientId,
        code_verifier: codeVerifier,
    });
    if (provider === "google")
        params.set("client_secret", settings.clientSecret);
    else
        params.set("client_secret", appleClientSecret(settings));

    const tokens = await fetchJson(settings.tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
    });
    return tokens.id_token;
}

async function completeAuthorization(provider, { state, code, error: providerError }) {
    if (typeof state !== "string" || state.length > 128)
        throw new AppError(400, "The sign-in request expired. Please try again.", "OAUTH_STATE_INVALID");
    const oauthState = await OAuthState.findOneAndDelete({
        stateHash: hashState(state),
        provider,
        expiresAt: { $gt: new Date() },
    });
    if (!oauthState)
        throw new AppError(400, "The sign-in request expired. Please try again.", "OAUTH_STATE_INVALID");
    if (providerError)
        throw new AppError(401, "Sign-in was canceled.", "OAUTH_CANCELLED");
    if (typeof code !== "string" || code.length > 4096)
        throw new AppError(400, "The sign-in provider returned an invalid response.", "OAUTH_CODE_INVALID");

    const settings = providerSettings(provider);
    const idToken = await exchangeCode(provider, settings, code, oauthState.codeVerifier);
    const claims = await verifiedClaims(settings, idToken, oauthState.nonce);
    return auth.signinWithOAuth({
        provider,
        subject: claims.sub,
        email: claims.email,
        emailVerified: claims.email_verified === true || claims.email_verified === "true",
    });
}

module.exports = { createAuthorizationUrl, completeAuthorization, providerSettings };
