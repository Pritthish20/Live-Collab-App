import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createCollaborationServer } from "./collaboration/hocuspocus.js";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { documentsRouter } from "./routes/documents.routes.js";
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

app.get("/health", (_request, response) => {
  ResponseUtils.sendData(response, {
    status: "ok"
  });
});

app.use("/api/auth", authRouter);
app.use("/api/documents", documentsRouter);
app.use(errorMiddleware.handle);

app.listen(env.SERVER_PORT, () => {
  console.log(`API server listening on http://localhost:${env.SERVER_PORT}`);
});

const collaborationServer = createCollaborationServer();
collaborationServer.listen();
console.log(`Collaboration server listening on ws://localhost:${env.COLLAB_PORT}`);
