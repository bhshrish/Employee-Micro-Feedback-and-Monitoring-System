import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { getConfig } from "../config/env";
import { User } from "../models/User";
import { unauthorized, forbidden } from "../utils/errors";

interface AccessPayload extends JwtPayload {
  sub: string;
  typ: "access";
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.get("authorization");
    if (!header?.startsWith("Bearer ")) throw unauthorized();
    const token = header.slice(7);
    const payload = jwt.verify(token, getConfig().JWT_ACCESS_SECRET, {
      issuer: "pulse-api",
      audience: "pulse-client",
    }) as AccessPayload;
    if (payload.typ !== "access" || !Types.ObjectId.isValid(payload.sub)) throw unauthorized();
    const user = await User.findById(payload.sub).select("organizationId teamId role subscription.status subscription.trialEndsAt");
    if (!user) throw unauthorized();
    req.auth = {
      userId: user._id,
      organizationId: user.organizationId,
      teamId: user.teamId,
      role: user.role,
    };
    next();
  } catch (error) {
    next(error instanceof Error && error.name === "TokenExpiredError" ? unauthorized("Access token expired") : error);
  }
}

export function requireRole(...roles: Array<"employee" | "manager" | "admin">) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      next(forbidden());
      return;
    }
    next();
  };
}

export async function requireEntitlement(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth) throw unauthorized();
    const user = await User.findById(req.auth.userId).select("subscription.plan subscription.status subscription.trialEndsAt");
    if (!user) throw unauthorized();
    const sub = user.subscription;
    if (sub.status === "trialing" && sub.trialEndsAt <= new Date()) {
      sub.status = "trial_expired";
      await user.save();
    }
    if (user.subscription.status === "trial_expired" || user.subscription.status === "canceled") {
      next(forbidden("A current trial or subscription is required"));
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}

export function requirePlan(...plans: Array<"Starter" | "Team" | "Business">) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) throw unauthorized();
      const user = await User.findById(req.auth.userId).select("subscription.plan subscription.status subscription.trialEndsAt");
      if (!user) throw unauthorized();
      if (user.subscription.status === "trialing" && user.subscription.trialEndsAt <= new Date()) {
        user.subscription.status = "trial_expired";
        await user.save();
      }
      if (user.subscription.status === "trial_expired" || user.subscription.status === "canceled") {
        next(forbidden("A current trial or subscription is required"));
        return;
      }
      if (!plans.includes(user.subscription.plan)) {
        next(forbidden("This feature is not available on your current plan"));
        return;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
