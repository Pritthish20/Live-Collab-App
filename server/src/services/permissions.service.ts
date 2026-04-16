import { Role } from "@prisma/client";
import { prisma } from "../db/prisma.js";

export class PermissionsService {
  async getDocumentRole(documentId: string, userId: string) {
    const collaborator = await prisma.collaborator.findUnique({
      where: {
        documentId_userId: {
          documentId,
          userId
        }
      },
      select: {
        role: true
      }
    });

    return collaborator?.role ?? null;
  }

  canRead(role: Role | null) {
    return role === Role.OWNER || role === Role.EDITOR || role === Role.VIEWER;
  }

  canEdit(role: Role | null) {
    return role === Role.OWNER || role === Role.EDITOR;
  }

  canManage(role: Role | null) {
    return role === Role.OWNER;
  }

  roleToApi(role: Role) {
    return role.toLowerCase() as "owner" | "editor" | "viewer";
  }
}

export const permissionsService = new PermissionsService();
