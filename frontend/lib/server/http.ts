import { randomUUID } from "node:crypto";
import { z } from "zod";

type JsonObject = Record<string, unknown>;

export class ApiError extends Error {
    constructor(
        readonly status: number,
        message: string,
        readonly code = "REQUEST_ERROR",
        readonly details?: unknown,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export function successResponse(body: unknown, status = 200): Response {
    let payload: unknown = body;

    if (Array.isArray(body)) {
        payload = { success: true, data: body, error: null };
    } else if (body && typeof body === "object") {
        const object = body as JsonObject;
        payload = object.error
            ? { ...object, success: false, data: object.data ?? null }
            : { success: true, data: object.data ?? object, error: object.error ?? null, ...object };
    }

    return Response.json(payload, { status });
}

export function errorResponse(error: unknown, requestId: string): Response {
    const applicationError = error instanceof Error
        ? error as Error & { statusCode?: number; code?: string; details?: unknown }
        : undefined;
    const apiError = error instanceof ApiError
        ? error
        : applicationError &&
            typeof applicationError.statusCode === "number" &&
            typeof applicationError.code === "string"
            ? new ApiError(
                applicationError.statusCode,
                applicationError.message,
                applicationError.code,
                applicationError.details,
            )
            : new ApiError(500, "An unexpected error occurred", "INTERNAL_ERROR");

    if (!(error instanceof ApiError) && !applicationError?.statusCode) {
        console.error("Unhandled Next.js API error", { requestId, error });
    }

    return Response.json({
        success: false,
        data: null,
        error: {
            code: apiError.code,
            message: apiError.message,
            ...(apiError.details === undefined ? {} : { details: apiError.details }),
            requestId,
        },
    }, { status: apiError.status });
}

export async function parseJson<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
    let value: unknown;
    try {
        value = await request.json();
    } catch {
        throw new ApiError(400, "Request body must be valid JSON", "INVALID_JSON");
    }

    const parsed = schema.safeParse(value);
    if (!parsed.success) {
        throw new ApiError(400, "Request validation failed", "VALIDATION_ERROR", parsed.error.flatten());
    }

    return parsed.data;
}

export async function apiRequest(
    request: Request,
    handler: (requestId: string) => Promise<Response>,
): Promise<Response> {
    const requestId = request.headers.get("x-request-id") || randomUUID();
    try {
        const response = await handler(requestId);
        response.headers.set("X-Request-ID", requestId);
        response.headers.set("Cache-Control", "no-store");
        return response;
    } catch (error) {
        const response = errorResponse(error, requestId);
        response.headers.set("X-Request-ID", requestId);
        response.headers.set("Cache-Control", "no-store");
        return response;
    }
}
