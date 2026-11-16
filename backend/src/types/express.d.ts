import type { Types } from "mongoose";

declare global {
    namespace Express {
        interface Request {
            auth?: {
                userId: Types.ObjectId;
                organizationId: Types.ObjectId;
                teamId?: Types.ObjectId | null;
                role: "admin" | "manager" | "employee";
            };
            requestId?: string;
            validatedBody?: unknown;
            validatedParams?: Record<string, unknown>;
            validatedQuery?: Record<string, any>;
        }
    }
}

export {};
