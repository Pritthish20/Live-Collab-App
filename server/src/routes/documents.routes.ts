import { Router } from "express";
import { collaboratorsController } from "../controllers/collaborators.controller.js";
import { documentsController } from "../controllers/documents.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export class DocumentsRoutes {
  public readonly router = Router();

  constructor() {
    this.router.use(authMiddleware.requireAuth);

    this.router.post("/", documentsController.create);
    this.router.get("/", documentsController.list);
    this.router.get("/:id/collaborators", collaboratorsController.list);
    this.router.post("/:id/share", collaboratorsController.share);
    this.router.patch(
      "/:id/collaborators/:collaboratorId",
      collaboratorsController.updateRole
    );
    this.router.delete(
      "/:id/collaborators/:collaboratorId",
      collaboratorsController.remove
    );
    this.router.get("/:id", documentsController.get);
    this.router.patch("/:id", documentsController.update);
    this.router.delete("/:id", documentsController.delete);
  }
}

export const documentsRouter = new DocumentsRoutes().router;
