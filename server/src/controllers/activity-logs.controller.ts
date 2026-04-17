import type { NextFunction, Request, Response } from "express";
import {
  ActivityLogsService,
  activityLogsService
} from "../services/activity-logs.service.js";
import { RequestUtils } from "../utils/request.js";
import { ResponseUtils } from "../utils/response.js";

export class ActivityLogsController {
  constructor(
    private readonly service: ActivityLogsService = activityLogsService
  ) {}

  list = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      const activity = await this.service.listDocumentActivity(
        RequestUtils.getRequiredParam(request, "id"),
        user.id
      );

      ResponseUtils.sendData(response, activity);
    } catch (error) {
      next(error);
    }
  };
}

export const activityLogsController = new ActivityLogsController();
