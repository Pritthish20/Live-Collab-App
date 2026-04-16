import { Role } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../utils/errors.js";
import { SessionUtils } from "../utils/session.js";
import {
  PermissionsService,
  permissionsService
} from "./permissions.service.js";

export type CollaborationUser = {
  id: string;
  email: string;
  role: Role;
};

export class CollaborationService {
  constructor(private readonly permissions: PermissionsService = permissionsService) {}

  async authenticateUser(
    documentName: string,
    token: string | null | undefined
  ): Promise<CollaborationUser> {
    if (!token) {
      throw new HttpError(401, "UNAUTHENTICATED", "Login is required.");
    }

    const session = this.verifyToken(token);
    const role = await this.permissions.getDocumentRole(documentName, session.userId);

    if (!role) {
      throw new HttpError(403, "FORBIDDEN", "You cannot access this document.");
    }

    return {
      id: session.userId,
      email: session.email,
      role
    };
  }

  isReadOnlyRole(role: Role) {
    return role === Role.VIEWER;
  }

  async fetchDocumentState(documentName: string) {
    const documentState = await prisma.documentState.findUnique({
      where: {
        documentId: documentName
      }
    });

    return documentState ? new Uint8Array(documentState.state) : null;
  }

  async storeDocumentState(documentName: string, state: Buffer | Uint8Array) {
    const document = await prisma.document.findUnique({
      where: {
        id: documentName
      }
    });

    if (!document) {
      return;
    }

    await prisma.$transaction([
      prisma.documentState.upsert({
        where: {
          documentId: documentName
        },
        create: {
          documentId: documentName,
          state: Buffer.from(state)
        },
        update: {
          state: Buffer.from(state)
        }
      }),
      prisma.document.update({
        where: {
          id: documentName
        },
        data: {
          updatedAt: new Date()
        }
      })
    ]);
  }

  private verifyToken(token: string) {
    try {
      return SessionUtils.verifyToken(token);
    } catch {
      throw new HttpError(401, "UNAUTHENTICATED", "Login is required.");
    }
  }
}

export const collaborationService = new CollaborationService();
