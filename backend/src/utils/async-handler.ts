import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRouteHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
) => unknown | Promise<unknown>;

export const asyncHandler = (handler: AsyncRouteHandler): RequestHandler =>
    (req: Request, res: Response, next: NextFunction): void => {
        void Promise.resolve(handler(req, res, next)).catch(next);
    };
