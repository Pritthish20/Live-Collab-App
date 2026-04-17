import { CommentThreadStatus, type Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import type {
  CommentReplyInput,
  CreateCommentThreadInput,
  UpdateCommentThreadInput
} from "../schemas/comments.schema.js";
import { HttpError } from "../utils/errors.js";
import {
  ActivityEventType,
  ActivityLogsService,
  activityLogsService
} from "./activity-logs.service.js";
import {
  PermissionsService,
  permissionsService
} from "./permissions.service.js";

type CommentThreadWithRelations = {
  id: string;
  status: CommentThreadStatus;
  anchor: Prisma.JsonValue | null;
  quote: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  resolvedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  comments: Array<{
    id: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
      id: string;
      name: string;
      email: string;
    } | null;
  }>;
};

export class CommentsService {
  constructor(
    private readonly permissions: PermissionsService = permissionsService,
    private readonly activityLogs: ActivityLogsService = activityLogsService
  ) {}

  async listThreads(documentId: string, userId: string) {
    await this.assertCanRead(documentId, userId);

    const threads = await prisma.commentThread.findMany({
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
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      },
      orderBy: [
        {
          createdAt: "asc"
        }
      ]
    });

    return threads.map((thread) => this.formatThread(thread));
  }

  async createThread(
    documentId: string,
    userId: string,
    input: CreateCommentThreadInput
  ) {
    await this.assertCanComment(documentId, userId);

    const thread = await prisma.$transaction(async (transaction) => {
      const createdThread = await transaction.commentThread.create({
        data: {
          documentId,
          createdById: userId,
          quote: input.quote,
          anchor: this.normalizeAnchor(input.anchor),
          comments: {
            create: {
              authorId: userId,
              body: input.body
            }
          }
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          resolvedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: "asc"
            }
          }
        }
      });

      await transaction.activityLog.create({
        data: {
          documentId,
          actorId: userId,
          eventType: ActivityEventType.commentThreadCreated,
          metadata: {
            threadId: createdThread.id
          }
        }
      });

      return createdThread;
    });

    return this.formatThread(thread);
  }

  async addReply(
    documentId: string,
    threadId: string,
    userId: string,
    input: CommentReplyInput
  ) {
    await this.assertCanComment(documentId, userId);
    const thread = await this.getThread(documentId, threadId);

    const nextStatus =
      thread.status === CommentThreadStatus.RESOLVED
        ? CommentThreadStatus.OPEN
        : thread.status;

    const updatedThread = await prisma.$transaction(async (transaction) => {
      await transaction.comment.create({
        data: {
          threadId,
          authorId: userId,
          body: input.body
        }
      });

      if (nextStatus !== thread.status) {
        await transaction.commentThread.update({
          where: {
            id: threadId
          },
          data: {
            status: nextStatus,
            resolvedAt: null,
            resolvedById: null
          }
        });

        await transaction.activityLog.create({
          data: {
            documentId,
            actorId: userId,
            eventType: ActivityEventType.commentThreadReopened,
            metadata: {
              threadId
            }
          }
        });
      }

      await transaction.activityLog.create({
        data: {
          documentId,
          actorId: userId,
          eventType: ActivityEventType.commentReplyAdded,
          metadata: {
            threadId
          }
        }
      });

      return await transaction.commentThread.findUniqueOrThrow({
        where: {
          id: threadId
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          resolvedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: "asc"
            }
          }
        }
      });
    });

    return this.formatThread(updatedThread);
  }

  async updateThread(
    documentId: string,
    threadId: string,
    userId: string,
    input: UpdateCommentThreadInput
  ) {
    await this.assertCanComment(documentId, userId);
    const thread = await this.getThread(documentId, threadId);
    const nextStatus = this.inputStatusToDb(input.status);

    const updatedThread = await prisma.$transaction(async (transaction) => {
      const result = await transaction.commentThread.update({
        where: {
          id: threadId
        },
        data: {
          status: nextStatus,
          resolvedAt:
            nextStatus === CommentThreadStatus.RESOLVED ? new Date() : null,
          resolvedById:
            nextStatus === CommentThreadStatus.RESOLVED ? userId : null
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          resolvedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: "asc"
            }
          }
        }
      });

      if (thread.status !== result.status) {
        await transaction.activityLog.create({
          data: {
            documentId,
            actorId: userId,
            eventType:
              result.status === CommentThreadStatus.RESOLVED
                ? ActivityEventType.commentThreadResolved
                : ActivityEventType.commentThreadReopened,
            metadata: {
              threadId
            }
          }
        });
      }

      return result;
    });

    return this.formatThread(updatedThread);
  }

  private async assertCanRead(documentId: string, userId: string) {
    const role = await this.permissions.getDocumentRole(documentId, userId);

    if (!role || !this.permissions.canRead(role)) {
      throw new HttpError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
    }
  }

  private async assertCanComment(documentId: string, userId: string) {
    const role = await this.permissions.getDocumentRole(documentId, userId);

    if (!role || !this.permissions.canRead(role)) {
      throw new HttpError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
    }

    if (!this.permissions.canEdit(role)) {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "You cannot comment on this document."
      );
    }
  }

  private async getThread(documentId: string, threadId: string) {
    const thread = await prisma.commentThread.findFirst({
      where: {
        id: threadId,
        documentId
      },
      select: {
        id: true,
        status: true
      }
    });

    if (!thread) {
      throw new HttpError(404, "COMMENT_THREAD_NOT_FOUND", "Comment not found.");
    }

    return thread;
  }

  private inputStatusToDb(status: UpdateCommentThreadInput["status"]) {
    return status === "resolved"
      ? CommentThreadStatus.RESOLVED
      : CommentThreadStatus.OPEN;
  }

  private normalizeAnchor(input: CreateCommentThreadInput["anchor"]) {
    if (!input) {
      return undefined;
    }

    return input as Prisma.InputJsonValue;
  }

  private formatThread(thread: CommentThreadWithRelations) {
    return {
      id: thread.id,
      status: thread.status.toLowerCase() as "open" | "resolved",
      anchor:
        thread.anchor && typeof thread.anchor === "object" ? thread.anchor : null,
      quote: thread.quote,
      resolvedAt: thread.resolvedAt,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      createdBy: thread.createdBy,
      resolvedBy: thread.resolvedBy,
      comments: thread.comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: comment.author
      }))
    };
  }
}

export const commentsService = new CommentsService();
