import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";

export class RequestLoggerMiddleware {
  handle = (request: Request, response: Response, next: NextFunction) => {
    const startedAt = Date.now();

    response.on("finish", () => {
      if (request.path === "/health") {
        return;
      }

      const durationMs = Date.now() - startedAt;
      const statusCode = response.statusCode;
      const message = `${request.method} ${this.pathWithoutQuery(request)} ${statusCode}`;
      const meta = {
        duration: `${durationMs}ms`
      };

      if (statusCode >= 500) {
        logger.error("http", message, meta);
        return;
      }

      if (statusCode >= 400) {
        logger.warn("http", message, meta);
        return;
      }

      logger.info("http", message, meta);
    });

    next();
  };

  private pathWithoutQuery(request: Request) {
    return request.originalUrl.split("?")[0] || request.path;
  }
}

export const requestLoggerMiddleware = new RequestLoggerMiddleware();
