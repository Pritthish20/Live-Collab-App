import { prisma } from "../db/prisma.js";
import { HttpError } from "../utils/errors.js";
import {
  PermissionsService,
  permissionsService
} from "./permissions.service.js";

type ActivityMetadata = Record<string, string | number | boolean | null | undefined>;

type ActivityLogRecord = {
  id: string;
  eventType: string;
  metadata: unknown;
  createdAt: Date;
  actor: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export class ActivityEventType {
  static readonly documentCreated = "document_created";
  static readonly documentRenamed = "document_renamed";
  static readonly collaboratorAdded = "collaborator_added";
  static readonly collaboratorRoleChanged = "collaborator_role_changed";
  static readonly collaboratorRemoved = "collaborator_removed";
  static readonly snapshotCreated = "snapshot_created";
  static readonly snapshotRestored = "snapshot_restored";
  static readonly commentThreadCreated = "comment_thread_created";
  static readonly commentReplyAdded = "comment_reply_added";
  static readonly commentThreadResolved = "comment_thread_resolved";
  static readonly commentThreadReopened = "comment_thread_reopened";
}

export class ActivityLogsService {
  constructor(private readonly permissions: PermissionsService = permissionsService) {}

  async listDocumentActivity(documentId: string, userId: string) {
    const role = await this.permissions.getDocumentRole(documentId, userId);

    if (!role || !this.permissions.canRead(role)) {
      throw new HttpError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
    }

    const activity = await prisma.activityLog.findMany({
      where: {
        documentId
      },
      include: {
        actor: {
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

    return activity.map((entry) => this.formatActivityLog(entry));
  }

  async logEvent(
    documentId: string,
    actorId: string | null,
    eventType: string,
    metadata?: ActivityMetadata
  ) {
    return prisma.activityLog.create({
      data: {
        documentId,
        actorId,
        eventType,
        metadata: this.normalizeMetadata(metadata)
      }
    });
  }

  private formatActivityLog(entry: ActivityLogRecord) {
    return {
      id: entry.id,
      eventType: entry.eventType,
      metadata:
        entry.metadata && typeof entry.metadata === "object" ? entry.metadata : null,
      actor: entry.actor,
      createdAt: entry.createdAt
    };
  }

  private normalizeMetadata(metadata?: ActivityMetadata) {
    if (!metadata) {
      return undefined;
    }

    const entries = Object.entries(metadata).filter(
      ([, value]) => value !== undefined
    );

    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  }
}

export const activityLogsService = new ActivityLogsService();
