import { Database } from "@hocuspocus/extension-database";
import { Server } from "@hocuspocus/server";
import { env } from "../config/env.js";
import { collaborationService } from "../services/collaboration.service.js";

export function createCollaborationServer() {
  return new Server({
    port: env.COLLAB_PORT,
    debounce: 1000,
    maxDebounce: 5000,
    async onAuthenticate({ connectionConfig, documentName, token }) {
      const user = await collaborationService.authenticateUser(documentName, token);
      connectionConfig.readOnly = collaborationService.isReadOnlyRole(user.role);

      return {
        user
      };
    },
    async onTokenSync({ connection, connectionConfig, documentName, token }) {
      const user = await collaborationService.authenticateUser(documentName, token);
      const readOnly = collaborationService.isReadOnlyRole(user.role);
      connectionConfig.readOnly = readOnly;
      connection.readOnly = readOnly;
    },
    extensions: [
      new Database({
        fetch: async ({ documentName }) => {
          return collaborationService.fetchDocumentState(documentName);
        },
        store: async ({ documentName, state }) => {
          await collaborationService.storeDocumentState(documentName, state);
        }
      })
    ]
  });
}
