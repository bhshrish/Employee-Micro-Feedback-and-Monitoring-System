export class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown;

    constructor(statusCode: number, message: string, code = "REQUEST_ERROR", details?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = "AppError";
    }
}

export const badRequest = (message: string, code?: string): AppError =>
    new AppError(400, message, code);
export const unauthorized = (message = "Authentication required"): AppError =>
    new AppError(401, message, "UNAUTHORIZED");
export const forbidden = (message = "You do not have permission to perform this action"): AppError =>
    new AppError(403, message, "FORBIDDEN");
export const notFound = (message: string): AppError =>
    new AppError(404, message, "NOT_FOUND");
export const conflict = (message: string, code = "CONFLICT"): AppError =>
    new AppError(409, message, code);
export const paymentRequired = (message = "An active subscription is required"): AppError =>
    new AppError(402, message, "SUBSCRIPTION_REQUIRED");
