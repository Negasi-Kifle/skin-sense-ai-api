import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "@/utils/HttpError";
import { logger } from "@/utils/logger";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: "Not found", path: req.path });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Invalid request body",
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }

  logger.error({ err, path: req.path }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
}
