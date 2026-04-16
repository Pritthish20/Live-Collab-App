import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { ResponseUtils } from "../utils/response.js";

export class ErrorMiddleware {
  handle: ErrorRequestHandler = (error, request, response, _next) => {
    if (error instanceof HttpError) {
      ResponseUtils.sendError(response, error.status, error.code, error.message);
      return;
    }

    if (error instanceof ZodError) {
      ResponseUtils.sendError(
        response,
        400,
        "VALIDATION_ERROR",
        "Invalid request payload."
      );
      return;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      ResponseUtils.sendError(response, 404, "NOT_FOUND", "Resource not found.");
      return;
    }

    logger.error("http", "unhandled error", {
      method: request.method,
      path: request.originalUrl.split("?")[0],
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : "Unknown error"
    });
    ResponseUtils.sendError(
      response,
      500,
      "INTERNAL_SERVER_ERROR",
      "Unexpected server error."
    );
  };
}

export const errorMiddleware = new ErrorMiddleware();
