import type { NextFunction, Request, Response } from "express";
import { AuthSchema } from "../schemas/auth.schema.js";
import { AuthService, authService } from "../services/auth.service.js";
import { RequestUtils } from "../utils/request.js";
import { ResponseUtils } from "../utils/response.js";
import { SessionUtils } from "../utils/session.js";

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  signup = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const result = await this.service.signup(AuthSchema.signup.parse(request.body));
      SessionUtils.setCookie(response, result.token);
      ResponseUtils.sendData(response, result, 201);
    } catch (error) {
      next(error);
    }
  };

  login = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const result = await this.service.login(AuthSchema.login.parse(request.body));
      SessionUtils.setCookie(response, result.token);
      ResponseUtils.sendData(response, result);
    } catch (error) {
      next(error);
    }
  };

  logout = (_request: Request, response: Response) => {
    SessionUtils.clearCookie(response);
    ResponseUtils.sendData(response, { ok: true });
  };

  me = (request: Request, response: Response) => {
    ResponseUtils.sendData(response, {
      user: RequestUtils.getAuthenticatedUser(request)
    });
  };
}

export const authController = new AuthController();
