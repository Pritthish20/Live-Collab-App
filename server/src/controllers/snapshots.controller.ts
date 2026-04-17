import type { NextFunction, Request, Response } from "express";
import { SnapshotsSchema } from "../schemas/snapshots.schema.js";
import {
  SnapshotsService,
  snapshotsService
} from "../services/snapshots.service.js";
import { RequestUtils } from "../utils/request.js";
import { ResponseUtils } from "../utils/response.js";

export class SnapshotsController {
  constructor(private readonly service: SnapshotsService = snapshotsService) {}

  list = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      const snapshots = await this.service.listSnapshots(
        RequestUtils.getRequiredParam(request, "id"),
        user.id
      );

      ResponseUtils.sendData(response, snapshots);
    } catch (error) {
      next(error);
    }
  };

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      const snapshot = await this.service.createSnapshot(
        RequestUtils.getRequiredParam(request, "id"),
        user.id,
        SnapshotsSchema.create.parse(request.body)
      );

      ResponseUtils.sendData(response, snapshot, 201);
    } catch (error) {
      next(error);
    }
  };

  restore = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      const result = await this.service.restoreSnapshot(
        RequestUtils.getRequiredParam(request, "id"),
        RequestUtils.getRequiredParam(request, "snapshotId"),
        user.id
      );

      ResponseUtils.sendData(response, result);
    } catch (error) {
      next(error);
    }
  };
}

export const snapshotsController = new SnapshotsController();
