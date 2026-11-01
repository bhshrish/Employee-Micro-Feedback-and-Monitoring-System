export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code = "REQUEST_ERROR",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const badRequest = (message: string, code?: string) => new AppError(400, message, code);
export const unauthorized = (message = "Authentication required") => new AppError(401, message, "UNAUTHORIZED");
export const forbidden = (message = "You do not have permission to perform this action") => new AppError(403, message, "FORBIDDEN");
export const notFound = (message = "Resource not found") => new AppError(404, message, "NOT_FOUND");
export const conflict = (message: string, code = "CONFLICT") => new AppError(409, message, code);
export const paymentRequired = (message = "An active subscription is required") =>
  new AppError(402, message, "SUBSCRIPTION_REQUIRED");
