import { createConnection } from "node:net";
import { Database } from "@hocuspocus/extension-database";
import { MessageType, Server } from "@hocuspocus/server";
import * as decoding from "lib0/decoding";
import { env } from "../config/env.js";
import {
  type CollaborationUser,
  collaborationService
} from "../services/collaboration.service.js";
import { HttpError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

type CollaborationContext = {
  user?: CollaborationUser;
};

const accessRevokedCloseEvent = {
  code: 4403,
  reason: "Access revoked"
};

const REDIS_EXTENSION_MODULE = "@hocuspocus/extension-redis";

type RedisExtensionModule = {
  Redis: new (config: { host: string; port: number }) => unknown;
};

export async function createCollaborationServer() {
  const redisExtension = await createRedisExtension();

  logger.info("ws", "redis ready", {
    instance: env.INSTANCE_NAME,
    target: `${env.REDIS_HOST}:${env.REDIS_PORT}`
  });

  return new Server({
    name: env.INSTANCE_NAME,
    port: env.COLLAB_PORT,
    stopOnSignals: false,
    quiet: true,
    debounce: 1000,
    maxDebounce: 5000,
    async onConnect({ documentName, socketId }) {
      logger.info("ws", "connect", {
        doc: logger.shortId(documentName),
        socket: logger.shortId(socketId)
      });
    },
    async onAuthenticate({ connectionConfig, documentName, token }) {
      const user = await authenticateForSocket(documentName, token);
      connectionConfig.readOnly = collaborationService.isReadOnlyRole(user.role);

      logger.info("ws", "auth", {
        doc: logger.shortId(documentName),
        user: logger.shortId(user.id),
        role: user.role.toLowerCase(),
        mode: connectionConfig.readOnly ? "read" : "write"
      });

      return {
        user
      };
    },
    async onTokenSync({ connection, connectionConfig, documentName, token }) {
      const user = await authenticateForSocket(documentName, token);
      const readOnly = collaborationService.isReadOnlyRole(user.role);
      connectionConfig.readOnly = readOnly;
      connection.readOnly = readOnly;

      logger.info("ws", "token synced", {
        doc: logger.shortId(documentName),
        user: logger.shortId(user.id),
        role: user.role.toLowerCase(),
        mode: readOnly ? "read" : "write"
      });

      return {
        user
      };
    },
    async beforeHandleMessage({ connection, context, documentName, socketId, update }) {
      if (!isSyncMessage(update)) {
        return;
      }

      const user = (context as CollaborationContext).user;

      if (!user) {
        connection.readOnly = true;
        connection.close(accessRevokedCloseEvent);
        logger.warn("ws", "access revoked", {
          doc: logger.shortId(documentName),
          socket: logger.shortId(socketId),
          reason: "missing_context"
        });
        return;
      }

      try {
        const role = await collaborationService.getAuthorizedRole(
          documentName,
          user.id
        );
        const readOnly = collaborationService.isReadOnlyRole(role);
        const previousRole = user.role;

        connection.readOnly = readOnly;
        user.role = role;

        if (previousRole !== role) {
          logger.info("ws", "access changed", {
            doc: logger.shortId(documentName),
            user: logger.shortId(user.id),
            role: role.toLowerCase(),
            mode: readOnly ? "read" : "write"
          });
        }
      } catch (error) {
        connection.readOnly = true;
        connection.close(accessRevokedCloseEvent);
        logger.warn("ws", "access revoked", {
          doc: logger.shortId(documentName),
          user: logger.shortId(user.id),
          reason: error instanceof HttpError ? error.code : "ACCESS_ERROR"
        });
      }
    },
    async onDisconnect({ clientsCount, documentName, socketId }) {
      logger.info("ws", "disconnect", {
        doc: logger.shortId(documentName),
        socket: logger.shortId(socketId),
        clients: clientsCount
      });
    },
    extensions: [
      redisExtension as never,
      new Database({
        fetch: async ({ documentName }) => {
          return collaborationService.fetchDocumentState(documentName);
        },
        store: async ({ clientsCount, documentName, state }) => {
          await collaborationService.storeDocumentState(documentName, state);
          logger.info("ws", "stored", {
            doc: logger.shortId(documentName),
            clients: clientsCount
          });
        }
      })
    ]
  });
}

async function createRedisExtension() {
  await assertRedisAvailable();

  try {
    const redisModule = (await import(
      REDIS_EXTENSION_MODULE
    )) as RedisExtensionModule;

    return new redisModule.Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT
    });
  } catch (error) {
    throw new Error(
      `Missing Redis extension. Install ${REDIS_EXTENSION_MODULE} in server dependencies before starting the collaboration server.`
    );
  }
}

function assertRedisAvailable() {
  return new Promise<void>((resolve, reject) => {
    const socket = createConnection({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT
    });

    const timer = setTimeout(() => {
      socket.destroy();
      reject(
        new Error(`Redis unavailable at ${env.REDIS_HOST}:${env.REDIS_PORT}`)
      );
    }, 2000);

    function cleanup() {
      clearTimeout(timer);
      socket.off("connect", onConnect);
      socket.off("error", onError);
    }

    function onConnect() {
      cleanup();
      socket.end();
      resolve();
    }

    function onError() {
      cleanup();
      socket.destroy();
      reject(
        new Error(`Redis unavailable at ${env.REDIS_HOST}:${env.REDIS_PORT}`)
      );
    }

    socket.once("connect", onConnect);
    socket.once("error", onError);
  });
}

async function authenticateForSocket(
  documentName: string,
  token: string | null | undefined
) {
  try {
    return await collaborationService.authenticateUser(documentName, token);
  } catch (error) {
    logger.warn("ws", "auth failed", {
      doc: logger.shortId(documentName),
      reason: error instanceof HttpError ? error.code : "AUTH_ERROR"
    });
    throw error;
  }
}

function isSyncMessage(update: Uint8Array) {
  try {
    const decoder = decoding.createDecoder(update);
    decoding.readVarString(decoder);
    const type = decoding.readVarUint(decoder);

    return type === MessageType.Sync || type === MessageType.SyncReply;
  } catch {
    return false;
  }
}
