import { Role } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import type { DocumentInput, ShareInput } from "../schemas/documents.schema.js";
import { HttpError } from "../utils/errors.js";
import {
  PermissionsService,
  permissionsService
} from "./permissions.service.js";

type DocumentSummaryRecord = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  collaborators: { role: Role }[];
};

export class DocumentsService {
  constructor(private readonly permissions: PermissionsService = permissionsService) {}

  async createDocument(userId: string, input: DocumentInput) {
    const document = await prisma.document.create({
      data: {
        title: input.title,
        ownerId: userId,
        collaborators: {
          create: {
            userId,
            role: Role.OWNER
          }
        }
      },
      include: {
        collaborators: {
          where: {
            userId
          },
          select: {
            role: true
          }
        }
      }
    });

    return this.formatDocumentSummary(document);
  }

  async listDocuments(userId: string) {
    const documents = await prisma.document.findMany({
      where: {
        collaborators: {
          some: {
            userId
          }
        }
      },
      include: {
        collaborators: {
          where: {
            userId
          },
          select: {
            role: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    return documents.map((document) => this.formatDocumentSummary(document));
  }

  async getDocument(documentId: string, userId: string) {
    const role = await this.permissions.getDocumentRole(documentId, userId);

    if (!role || !this.permissions.canRead(role)) {
      throw new HttpError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
    }

    const document = await prisma.document.findUnique({
      where: {
        id: documentId
      }
    });

    if (!document) {
      throw new HttpError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
    }

    return {
      id: document.id,
      title: document.title,
      ownerId: document.ownerId,
      role: this.permissions.roleToApi(role),
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    };
  }

  async updateDocument(
    documentId: string,
    userId: string,
    input: DocumentInput
  ) {
    const role = await this.permissions.getDocumentRole(documentId, userId);

    if (!role || !this.permissions.canEdit(role)) {
      throw new HttpError(403, "FORBIDDEN", "You cannot edit this document.");
    }

    const document = await prisma.document.update({
      where: {
        id: documentId
      },
      data: {
        title: input.title
      }
    });

    return {
      id: document.id,
      title: document.title,
      ownerId: document.ownerId,
      role: this.permissions.roleToApi(role),
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    };
  }

  async deleteDocument(documentId: string, userId: string) {
    const role = await this.permissions.getDocumentRole(documentId, userId);

    if (!role || !this.permissions.canManage(role)) {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "Only the owner can delete this document."
      );
    }

    await prisma.document.delete({
      where: {
        id: documentId
      }
    });

    return { ok: true };
  }

  async shareDocument(documentId: string, userId: string, input: ShareInput) {
    const role = await this.permissions.getDocumentRole(documentId, userId);

    if (!role || !this.permissions.canManage(role)) {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "Only the owner can share this document."
      );
    }

    const collaboratorUser = await prisma.user.findUnique({
      where: {
        email: input.email
      }
    });

    if (!collaboratorUser) {
      throw new HttpError(404, "USER_NOT_FOUND", "No user found for that email.");
    }

    const collaborator = await prisma.collaborator.upsert({
      where: {
        documentId_userId: {
          documentId,
          userId: collaboratorUser.id
        }
      },
      create: {
        documentId,
        userId: collaboratorUser.id,
        role: input.role === "editor" ? Role.EDITOR : Role.VIEWER
      },
      update: {
        role: input.role === "editor" ? Role.EDITOR : Role.VIEWER
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return {
      user: collaborator.user,
      role: this.permissions.roleToApi(collaborator.role)
    };
  }

  private formatDocumentSummary(document: DocumentSummaryRecord) {
    return {
      id: document.id,
      title: document.title,
      role: this.permissions.roleToApi(document.collaborators[0].role),
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    };
  }
}

export const documentsService = new DocumentsService();
