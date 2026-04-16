import { Database } from "@hocuspocus/extension-database";
import { Server } from "@hocuspocus/server";
import { env } from "../config/env.js";
import { collaborationService } from "../services/collaboration.service.js";
import { HttpError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export function createCollaborationServer() {
  return new Server({
    port: env.COLLAB_PORT,
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
    },
    async onDisconnect({ clientsCount, documentName, socketId }) {
      logger.info("ws", "disconnect", {
        doc: logger.shortId(documentName),
        socket: logger.shortId(socketId),
        clients: clientsCount
      });
    },
    extensions: [
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
