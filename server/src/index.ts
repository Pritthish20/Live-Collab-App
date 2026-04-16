import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createCollaborationServer } from "./collaboration/hocuspocus.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./db/prisma.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { requestLoggerMiddleware } from "./middlewares/request-logger.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { documentsRouter } from "./routes/documents.routes.js";
import { logger } from "./utils/logger.js";
import { ResponseUtils } from "./utils/response.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true
  })
);
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(requestLoggerMiddleware.handle);

app.get("/health", (_request, response) => {
  ResponseUtils.sendData(response, {
    status: "ok"
  });
});

app.use("/api/auth", authRouter);
app.use("/api/documents", documentsRouter);
app.use(errorMiddleware.handle);

async function bootstrap() {
  await connectDatabase();

  app.listen(env.SERVER_PORT, () => {
    logger.info("api", "listening", {
      url: `http://localhost:${env.SERVER_PORT}`
    });
  });

  const collaborationServer = createCollaborationServer();
  collaborationServer.listen();
  logger.info("ws", "listening", {
    url: `ws://localhost:${env.COLLAB_PORT}`
  });
}

process.on("SIGINT", () => {
  logger.info("api", "shutdown", {
    signal: "SIGINT"
  });
  void disconnectDatabase().finally(() => process.exit(0));
});

process.on("SIGTERM", () => {
  logger.info("api", "shutdown", {
    signal: "SIGTERM"
  });
  void disconnectDatabase().finally(() => process.exit(0));
});

bootstrap().catch((error) => {
  logger.error("api", "startup failed", {
    message: error instanceof Error ? error.message : "Unknown error"
  });
  void disconnectDatabase().finally(() => process.exit(1));
});
