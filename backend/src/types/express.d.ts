import type { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: Types.ObjectId;
        organizationId: Types.ObjectId;
        teamId: Types.ObjectId | null;
        role: "employee" | "manager" | "admin";
      };
      requestId?: string;
      validatedQuery?: unknown;
    }
  }
}

export {};
