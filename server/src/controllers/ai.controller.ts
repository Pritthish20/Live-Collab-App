import type { NextFunction, Request, Response } from "express";
import { AiSchema } from "../schemas/ai.schema.js";
import { AiService, aiService } from "../services/ai.service.js";
import { RequestUtils } from "../utils/request.js";
import { ResponseUtils } from "../utils/response.js";

export class AiController {
  constructor(private readonly service: AiService = aiService) {}

  generateDocumentReport = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      const report = await this.service.generateDocumentReport(
        RequestUtils.getRequiredParam(request, "id"),
        user.id
      );

      ResponseUtils.sendData(response, report);
    } catch (error) {
      next(error);
    }
  };

  summarizeComments = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      const summary = await this.service.summarizeComments(
        RequestUtils.getRequiredParam(request, "id"),
        user.id
      );

      ResponseUtils.sendData(response, summary);
    } catch (error) {
      next(error);
    }
  };

  downloadDocumentReportPdf = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const user = RequestUtils.getAuthenticatedUser(request);
      const pdf = await this.service.generateDocumentReportPdf(
        RequestUtils.getRequiredParam(request, "id"),
        user.id,
        AiSchema.documentReport.parse(request.body)
      );

      response.setHeader("Content-Type", "application/pdf");
      response.setHeader(
        "Content-Disposition",
        `attachment; filename="${pdf.fileName}"`
      );
      response.send(pdf.buffer);
    } catch (error) {
      next(error);
    }
  };
}

export const aiController = new AiController();
