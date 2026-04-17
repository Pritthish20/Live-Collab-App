import type { NextFunction, Request, Response } from "express";
import { CommentsSchema } from "../schemas/comments.schema.js";
import {
  CommentsService,
  commentsService
} from "../services/comments.service.js";
import { RequestUtils } from "../utils/request.js";
import { ResponseUtils } from "../utils/response.js";

export class CommentsController {
  constructor(private readonly service: CommentsService = commentsService) {}

  list = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      const threads = await this.service.listThreads(
        RequestUtils.getRequiredParam(request, "id"),
        user.id
      );

      ResponseUtils.sendData(response, threads);
    } catch (error) {
      next(error);
    }
  };

  createThread = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      const thread = await this.service.createThread(
        RequestUtils.getRequiredParam(request, "id"),
        user.id,
        CommentsSchema.createThread.parse(request.body)
      );

      ResponseUtils.sendData(response, thread, 201);
    } catch (error) {
      next(error);
    }
  };

  addReply = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      const thread = await this.service.addReply(
        RequestUtils.getRequiredParam(request, "id"),
        RequestUtils.getRequiredParam(request, "threadId"),
        user.id,
        CommentsSchema.reply.parse(request.body)
      );

      ResponseUtils.sendData(response, thread);
    } catch (error) {
      next(error);
    }
  };

  updateThread = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      const thread = await this.service.updateThread(
        RequestUtils.getRequiredParam(request, "id"),
        RequestUtils.getRequiredParam(request, "threadId"),
        user.id,
        CommentsSchema.updateThread.parse(request.body)
      );

      ResponseUtils.sendData(response, thread);
    } catch (error) {
      next(error);
    }
  };
}

export const commentsController = new CommentsController();
