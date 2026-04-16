import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export class AuthRoutes {
  public readonly router = Router();

  constructor() {
    this.router.post("/signup", authController.signup);
    this.router.post("/login", authController.login);
    this.router.post("/logout", authController.logout);
    this.router.get("/me", authMiddleware.requireAuth, authController.me);
  }
}

export const authRouter = new AuthRoutes().router;
