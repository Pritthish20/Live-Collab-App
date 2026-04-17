import { ResetConnection } from "@hocuspocus/common";
import type { Server } from "@hocuspocus/server";
import { logger } from "../utils/logger.js";

export class CollaborationRuntime {
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  clearServer() {
    this.server = null;
  }

  async persistDocumentState(documentId: string) {
    if (!this.server) {
      return false;
    }

    const directConnection = await this.server.hocuspocus.openDirectConnection(
      documentId,
      {
        source: "snapshot"
      }
    );

    await directConnection.disconnect();

    return true;
  }

  async resetActiveDocument(documentId: string) {
    if (!this.server) {
      return false;
    }

    const activeDocument = this.server.hocuspocus.documents.get(documentId);

    if (!activeDocument) {
      return false;
    }

    const debounceId = `onStoreDocument-${documentId}`;

    if (this.server.hocuspocus.debouncer.isDebounced(debounceId)) {
      await this.server.hocuspocus.debouncer.executeNow(debounceId);
    }

    this.server.hocuspocus.documents.delete(documentId);

    activeDocument.connections.forEach(({ connection }) => {
      connection.close(ResetConnection);
    });

    activeDocument.destroy();

    logger.info("ws", "document reset", {
      doc: logger.shortId(documentId)
    });

    return true;
  }
}

export const collaborationRuntime = new CollaborationRuntime();
