import type { Response } from "express";
import { getConfig } from "../config/env";
import * as auth from "../services/auth.service";
import { asyncHandler } from "../utils/async-handler";
import { unauthorized } from "../utils/errors";

const cookieName = "pulse_refresh";
function cookieOptions() {
  const config = getConfig();
  return {
    httpOnly: true,
    secure: config.COOKIE_SECURE || config.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api/v1/auth",
    ...(config.COOKIE_DOMAIN ? { domain: config.COOKIE_DOMAIN } : {}),
    maxAge: config.REFRESH_TOKEN_DAYS * 86_400_000,
  };
}
function setSession(res: Response, result: Awaited<ReturnType<typeof auth.signin>>, statusCode = 200) {
  res.cookie(cookieName, result.refreshToken, cookieOptions());
  res.setHeader("Cache-Control", "no-store");
  res.status(statusCode).json({ user: result.user, accessToken: result.accessToken, tokenType: "Bearer" });
}

export const signup = asyncHandler(async (req, res) => setSession(res, await auth.signup(req.body), 201));
export const signin = asyncHandler(async (req, res) => setSession(res, await auth.signin(req.body)));
export const acceptInvitation = asyncHandler(async (req, res) => setSession(res, await auth.acceptInvitation(req.body), 201));

export const refresh = asyncHandler(async (req, res) => {
  const raw = req.cookies?.[cookieName];
  if (!raw) throw unauthorized("Refresh cookie is required");
  setSession(res, await auth.rotateRefreshToken(raw));
});

export const logout = asyncHandler(async (req, res) => {
  await auth.revokeRefreshToken(req.cookies?.[cookieName]);
  res.clearCookie(cookieName, { ...cookieOptions(), maxAge: undefined });
  res.status(204).end();
});

export const logoutEverywhere = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  await auth.revokeAllRefreshTokens(req.auth.userId);
  res.clearCookie(cookieName, { ...cookieOptions(), maxAge: undefined });
  res.status(204).end();
});

export const me = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  res.json({ user: await auth.getCurrentUser(req.auth.userId) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const { User } = await import("../models/User");
  const update: Record<string, unknown> = {};
  if (req.body.name !== undefined) update.name = req.body.name;
  if (req.body.settings?.idleThresholdMinutes !== undefined) update["settings.idleThresholdMinutes"] = req.body.settings.idleThresholdMinutes;
  for (const [key, value] of Object.entries(req.body.settings?.notifications ?? {})) {
    update[`settings.notifications.${key}`] = value;
  }
  const user = await User.findOneAndUpdate(
    { _id: req.auth.userId, organizationId: req.auth.organizationId },
    { $set: update },
    { new: true, runValidators: true },
  );
  if (!user) throw unauthorized();
  res.json({ user: await auth.getCurrentUser(user._id) });
});
