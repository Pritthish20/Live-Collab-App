import { Router } from "express";
import { documentsController } from "../controllers/documents.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export class DocumentsRoutes {
  public readonly router = Router();

  constructor() {
    this.router.use(authMiddleware.requireAuth);

    this.router.post("/", documentsController.create);
    this.router.get("/", documentsController.list);
    this.router.get("/:id", documentsController.get);
    this.router.patch("/:id", documentsController.update);
    this.router.delete("/:id", documentsController.delete);
    this.router.post("/:id/share", documentsController.share);
  }
}

export const documentsRouter = new DocumentsRoutes().router;
