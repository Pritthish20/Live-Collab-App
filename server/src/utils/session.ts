import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type SessionUser = {
  userId: string;
  email: string;
};

export class SessionUtils {
  static createToken(payload: SessionUser) {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: "7d"
    });
  }

  static verifyToken(token: string): SessionUser {
    return jwt.verify(token, env.JWT_SECRET) as SessionUser;
  }

  static getTokenFromRequest(request: Request) {
    const header = request.header("authorization");
    const bearerToken = header?.startsWith("Bearer ") ? header.slice(7) : null;
    return bearerToken ?? request.cookies?.[env.COOKIE_NAME] ?? null;
  }

  static setCookie(response: Response, token: string) {
    response.cookie(env.COOKIE_NAME, token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  }

  static clearCookie(response: Response) {
    response.clearCookie(env.COOKIE_NAME, {
      path: "/"
    });
  }
}
