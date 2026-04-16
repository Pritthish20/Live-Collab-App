import type { NextFunction, Request, Response } from "express";
import { DocumentsSchema } from "../schemas/documents.schema.js";
import {
  DocumentsService,
  documentsService
} from "../services/documents.service.js";
import { RequestUtils } from "../utils/request.js";
import { ResponseUtils } from "../utils/response.js";

export class DocumentsController {
  constructor(private readonly service: DocumentsService = documentsService) {}

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      const document = await this.service.createDocument(
        user.id,
        DocumentsSchema.document.parse(request.body)
      );
      ResponseUtils.sendData(response, document, 201);
    } catch (error) {
      next(error);
    }
  };

  list = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      ResponseUtils.sendData(response, await this.service.listDocuments(user.id));
    } catch (error) {
      next(error);
    }
  };

  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      ResponseUtils.sendData(
        response,
        await this.service.getDocument(
          RequestUtils.getRequiredParam(request, "id"),
          user.id
        )
      );
    } catch (error) {
      next(error);
    }
  };

  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      const document = await this.service.updateDocument(
        RequestUtils.getRequiredParam(request, "id"),
        user.id,
        DocumentsSchema.document.parse(request.body)
      );
      ResponseUtils.sendData(response, document);
    } catch (error) {
      next(error);
    }
  };

  delete = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      ResponseUtils.sendData(
        response,
        await this.service.deleteDocument(
          RequestUtils.getRequiredParam(request, "id"),
          user.id
        )
      );
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
        DocumentsSchema.share.parse(request.body)
      );
      ResponseUtils.sendData(response, collaborator);
    } catch (error) {
      next(error);
    }
  };
}

export const documentsController = new DocumentsController();
