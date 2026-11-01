import { AppError } from "./errors";

export const unavailable = (message: string) => new AppError(503, message, "SERVICE_UNAVAILABLE");
