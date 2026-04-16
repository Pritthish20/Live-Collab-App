import type { Request } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { HttpError } from "./errors.js";

export class RequestUtils {
  static getAuthenticatedUser(request: Request) {
    return (request as unknown as AuthenticatedRequest).user;
  }

  static getRequiredParam(request: Request, name: string) {
    const value = request.params[name];

    if (typeof value !== "string" || value.length === 0) {
      throw new HttpError(
        400,
        "INVALID_ROUTE_PARAM",
        `Missing route param: ${name}.`
      );
    }

    return value;
  }
}
