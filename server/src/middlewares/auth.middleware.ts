import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../utils/errors.js";
import { SessionUtils } from "../utils/session.js";

export type AuthenticatedRequest = Request & {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export class AuthMiddleware {
  requireAuth = async (
    request: Request,
    _response: Response,
    next: NextFunction
  ) => {
    try {
      const token = SessionUtils.getTokenFromRequest(request);

      if (!token) {
        throw new HttpError(401, "UNAUTHENTICATED", "Login is required.");
      }

      const session = SessionUtils.verifyToken(token);
      const user = await prisma.user.findUnique({
        where: {
          id: session.userId
        },
        select: {
          id: true,
          name: true,
          email: true
        }
      });

      if (!user) {
        throw new HttpError(401, "UNAUTHENTICATED", "Login is required.");
      }

      (request as AuthenticatedRequest).user = user;
      next();
    } catch (error) {
      next(
        error instanceof HttpError
          ? error
          : new HttpError(401, "UNAUTHENTICATED", "Login is required.")
      );
    }
  };
}

export const authMiddleware = new AuthMiddleware();
