import type { Response } from "express";

export class ResponseUtils {
  static sendData<T>(response: Response, data: T, status = 200) {
    return response.status(status).json({
      data,
      error: null
    });
  }

  static sendError(
    response: Response,
    status: number,
    code: string,
    message: string
  ) {
    return response.status(status).json({
      data: null,
      error: {
        code,
        message
      }
    });
  }
}
