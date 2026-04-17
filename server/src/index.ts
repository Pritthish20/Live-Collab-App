import type { Server as HttpServer } from "node:http";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createCollaborationServer } from "./collaboration/hocuspocus.js";
import { collaborationRuntime } from "./collaboration/runtime.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./db/prisma.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { requestLoggerMiddleware } from "./middlewares/request-logger.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { documentsRouter } from "./routes/documents.routes.js";
import { logger } from "./utils/logger.js";
import { ResponseUtils } from "./utils/response.js";

const app = express();
let apiServer: HttpServer | null = null;
let collaborationServer: ReturnType<typeof createCollaborationServer> | null = null;

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

  apiServer = await listenApi();

  collaborationServer = createCollaborationServer();
  collaborationRuntime.setServer(collaborationServer);
  await listenCollaboration(collaborationServer);
}

function listenApi() {
  return new Promise<HttpServer>((resolve, reject) => {
    const server = app.listen(env.SERVER_PORT);

    function cleanup() {
      server.off("error", onError);
      server.off("listening", onListening);
    }

    function onError(error: Error) {
      cleanup();
      reject(error);
    }

    function onListening() {
      cleanup();
      logger.info("api", "listening", {
        url: `http://localhost:${env.SERVER_PORT}`
      });
      resolve(server);
    }

    server.once("error", onError);
    server.once("listening", onListening);
  });
}

function listenCollaboration(server: ReturnType<typeof createCollaborationServer>) {
  return new Promise<void>((resolve, reject) => {
    function cleanup() {
      server.httpServer.off("error", onError);
    }

    function onError(error: Error) {
      cleanup();
      reject(error);
    }

    server.httpServer.once("error", onError);
    server
      .listen()
      .then(() => {
        cleanup();
        logger.info("ws", "listening", {
          url: `ws://localhost:${env.COLLAB_PORT}`
        });
        resolve();
      })
      .catch((error: unknown) => {
        cleanup();
        reject(error);
      });
  });
}

async function shutdown(signal?: string) {
  if (signal) {
    logger.info("api", "shutdown", {
      signal
    });
  }

  if (collaborationServer) {
    await collaborationServer.destroy();
    collaborationRuntime.clearServer();
    collaborationServer = null;
  }

  if (apiServer) {
    await new Promise<void>((resolve) => {
      apiServer?.close(() => resolve());
    });
    apiServer = null;
  }

  await disconnectDatabase();
}

function getStartupErrorMessage(error: unknown) {
  if (isNodeError(error) && error.code === "EADDRINUSE") {
    return `Port already in use: ${error.port ?? "unknown"}`;
  }

  return error instanceof Error ? error.message : "Unknown error";
}

function isNodeError(error: unknown): error is Error & {
  code?: string;
  port?: number;
} {
  return error instanceof Error;
}

process.on("SIGINT", () => {
  void shutdown("SIGINT").finally(() => process.exit(0));
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM").finally(() => process.exit(0));
});

bootstrap().catch((error) => {
  logger.error("api", "startup failed", {
    message: getStartupErrorMessage(error)
  });
  void shutdown().finally(() => process.exit(1));
});
