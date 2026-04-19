import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import type { SnapshotCreateInput } from "../schemas/snapshots.schema.js";
import { HttpError } from "../utils/errors.js";
import {
  ActivityEventType,
  ActivityLogsService,
  activityLogsService
} from "./activity-logs.service.js";
import { collaborationRuntime } from "../collaboration/runtime.js";
import {
  PermissionsService,
  permissionsService
} from "./permissions.service.js";

type SnapshotRecord = {
  id: string;
  title: string | null;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export class SnapshotsService {
  constructor(
    private readonly permissions: PermissionsService = permissionsService,
    private readonly activityLogs: ActivityLogsService = activityLogsService
  ) {}

  async listSnapshots(documentId: string, userId: string) {
    await this.assertCanRead(documentId, userId);

    const snapshots = await prisma.snapshot.findMany({
      where: {
        documentId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 100
    });

    return snapshots.map((snapshot: SnapshotRecord) => this.formatSnapshot(snapshot));
  }

  async createSnapshot(
    documentId: string,
    userId: string,
    input: SnapshotCreateInput
  ) {
    await this.assertCanEdit(documentId, userId);
    await collaborationRuntime.persistDocumentState(documentId);

    const documentState = await prisma.documentState.findUnique({
      where: {
        documentId
      },
      select: {
        state: true
      }
    });

    if (!documentState) {
      throw new HttpError(
        409,
        "DOCUMENT_STATE_UNAVAILABLE",
        "Document state is not available yet."
      );
    }

    const snapshot = await prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
      const createdSnapshot = await transaction.snapshot.create({
        data: {
          documentId,
          createdById: userId,
          title: input.title,
          state: documentState.state
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      await transaction.activityLog.create({
        data: {
          documentId,
          actorId: userId,
          eventType: ActivityEventType.snapshotCreated,
          metadata: {
            snapshotId: createdSnapshot.id,
            title: createdSnapshot.title ?? null
          }
        }
      });

        return createdSnapshot;
      }
    );

    return this.formatSnapshot(snapshot);
  }

  async restoreSnapshot(documentId: string, snapshotId: string, userId: string) {
    await this.assertCanManage(documentId, userId);

    const snapshot = await prisma.snapshot.findFirst({
      where: {
        id: snapshotId,
        documentId
      },
      select: {
        id: true,
        title: true,
        state: true,
        createdAt: true
      }
    });

    if (!snapshot) {
      throw new HttpError(404, "SNAPSHOT_NOT_FOUND", "Snapshot not found.");
    }

    await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      await transaction.documentState.upsert({
        where: {
          documentId
        },
        create: {
          documentId,
          state: snapshot.state
        },
        update: {
          state: snapshot.state
        }
      });

      await transaction.document.update({
        where: {
          id: documentId
        },
        data: {
          updatedAt: new Date()
        }
      });

      await transaction.activityLog.create({
        data: {
          documentId,
          actorId: userId,
          eventType: ActivityEventType.snapshotRestored,
          metadata: {
            snapshotId: snapshot.id,
            title: snapshot.title ?? null,
            snapshotCreatedAt: snapshot.createdAt.toISOString()
          }
        }
      });
    });

    const forcedReconnect = await collaborationRuntime.resetActiveDocument(
      documentId
    );

    return {
      ok: true,
      snapshotId: snapshot.id,
      forcedReconnect
    };
  }

  private async assertCanRead(documentId: string, userId: string) {
    const role = await this.permissions.getDocumentRole(documentId, userId);

    if (!role || !this.permissions.canRead(role)) {
      throw new HttpError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
    }
  }

  private async assertCanEdit(documentId: string, userId: string) {
    const role = await this.permissions.getDocumentRole(documentId, userId);

    if (!role || !this.permissions.canRead(role)) {
      throw new HttpError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
    }

    if (!this.permissions.canEdit(role)) {
      throw new HttpError(403, "FORBIDDEN", "You cannot edit this document.");
    }
  }

  private async assertCanManage(documentId: string, userId: string) {
    const role = await this.permissions.getDocumentRole(documentId, userId);

    if (!role || !this.permissions.canRead(role)) {
      throw new HttpError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
    }

    if (!this.permissions.canManage(role)) {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "Only the owner can restore a snapshot."
      );
    }
  }

  private formatSnapshot(snapshot: SnapshotRecord) {
    return {
      id: snapshot.id,
      title: snapshot.title,
      createdAt: snapshot.createdAt,
      createdBy: snapshot.createdBy
    };
  }
}

export const snapshotsService = new SnapshotsService();
