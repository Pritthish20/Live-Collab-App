import type { NextFunction, Request, Response } from "express";
import { CollaboratorsSchema } from "../schemas/collaborators.schema.js";
import {
  CollaboratorsService,
  collaboratorsService
} from "../services/collaborators.service.js";
import { RequestUtils } from "../utils/request.js";
import { ResponseUtils } from "../utils/response.js";

export class CollaboratorsController {
  constructor(
    private readonly service: CollaboratorsService = collaboratorsService
  ) {}

  list = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      const collaborators = await this.service.listCollaborators(
        RequestUtils.getRequiredParam(request, "id"),
        user.id
      );

      ResponseUtils.sendData(response, collaborators);
    } catch (error) {
      next(error);
    }
  };

  share = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      const collaborator = await this.service.shareDocument(
        RequestUtils.getRequiredParam(request, "id"),
        user.id,
        CollaboratorsSchema.share.parse(request.body)
      );

      ResponseUtils.sendData(response, collaborator);
    } catch (error) {
      next(error);
    }
  };

  updateRole = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      const collaborator = await this.service.updateCollaboratorRole(
        RequestUtils.getRequiredParam(request, "id"),
        user.id,
        RequestUtils.getRequiredParam(request, "collaboratorId"),
        CollaboratorsSchema.updateRole.parse(request.body)
      );

      ResponseUtils.sendData(response, collaborator);
    } catch (error) {
      next(error);
    }
  };

  remove = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      const result = await this.service.removeCollaborator(
        RequestUtils.getRequiredParam(request, "id"),
        user.id,
        RequestUtils.getRequiredParam(request, "collaboratorId")
      );

      ResponseUtils.sendData(response, result);
    } catch (error) {
      next(error);
    }
  };
}

export const collaboratorsController = new CollaboratorsController();
