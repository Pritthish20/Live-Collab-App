import { Role } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import type {
  ShareCollaboratorInput,
  UpdateCollaboratorRoleInput
} from "../schemas/collaborators.schema.js";
import { HttpError } from "../utils/errors.js";
import {
  ActivityEventType
} from "./activity-logs.service.js";
import {
  PermissionsService,
  permissionsService
} from "./permissions.service.js";

type CollaboratorWithUser = {
  id: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export class CollaboratorsService {
  constructor(private readonly permissions: PermissionsService = permissionsService) {}

  async listCollaborators(documentId: string, actorId: string) {
    await this.assertCanManage(documentId, actorId);

    const collaborators = await prisma.collaborator.findMany({
      where: {
        documentId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        {
          role: "asc"
        },
        {
          createdAt: "asc"
        }
      ]
    });

    return collaborators.map((collaborator) =>
      this.formatCollaborator(collaborator)
    );
  }

  async shareDocument(
    documentId: string,
    actorId: string,
    input: ShareCollaboratorInput
  ) {
    await this.assertCanManage(documentId, actorId);

    const collaboratorUser = await prisma.user.findUnique({
      where: {
        email: input.email
      }
    });

    if (!collaboratorUser) {
      throw new HttpError(404, "USER_NOT_FOUND", "No user found for that email.");
    }

    const nextRole = this.inputRoleToDb(input.role);
    const existingCollaborator = await prisma.collaborator.findUnique({
      where: {
        documentId_userId: {
          documentId,
          userId: collaboratorUser.id
        }
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

    if (existingCollaborator?.role === Role.OWNER) {
      throw new HttpError(
        400,
        "OWNER_ROLE_LOCKED",
        "The document owner role cannot be changed."
      );
    }

    if (existingCollaborator) {
      const collaborator = await prisma.$transaction(async (transaction) => {
        const updatedCollaborator = await transaction.collaborator.update({
          where: {
            id: existingCollaborator.id
          },
          data: {
            role: nextRole
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

        if (existingCollaborator.role !== updatedCollaborator.role) {
          await transaction.activityLog.create({
            data: {
              documentId,
              actorId,
              eventType: ActivityEventType.collaboratorRoleChanged,
              metadata: {
                collaboratorId: updatedCollaborator.id,
                collaboratorEmail: updatedCollaborator.user.email,
                previousRole: this.permissions.roleToApi(existingCollaborator.role),
                nextRole: this.permissions.roleToApi(updatedCollaborator.role)
              }
            }
          });
        }

        return updatedCollaborator;
      });

      return this.formatCollaborator(collaborator);
    }

    const collaborator = await prisma.$transaction(async (transaction) => {
      const createdCollaborator = await transaction.collaborator.create({
        data: {
          documentId,
          userId: collaboratorUser.id,
          role: nextRole
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

      await transaction.activityLog.create({
        data: {
          documentId,
          actorId,
          eventType: ActivityEventType.collaboratorAdded,
          metadata: {
            collaboratorId: createdCollaborator.id,
            collaboratorEmail: createdCollaborator.user.email,
            role: this.permissions.roleToApi(createdCollaborator.role)
          }
        }
      });

      return createdCollaborator;
    });

    return this.formatCollaborator(collaborator);
  }

  async updateCollaboratorRole(
    documentId: string,
    actorId: string,
    collaboratorId: string,
    input: UpdateCollaboratorRoleInput
  ) {
    await this.assertCanManage(documentId, actorId);

    const collaborator = await this.getCollaborator(documentId, collaboratorId);

    if (collaborator.role === Role.OWNER) {
      throw new HttpError(
        400,
        "OWNER_ROLE_LOCKED",
        "The document owner role cannot be changed."
      );
    }

    const nextRole = this.inputRoleToDb(input.role);
    const updatedCollaborator = await prisma.$transaction(async (transaction) => {
      const result = await transaction.collaborator.update({
        where: {
          id: collaborator.id
        },
        data: {
          role: nextRole
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

      if (collaborator.role !== result.role) {
        await transaction.activityLog.create({
          data: {
            documentId,
            actorId,
            eventType: ActivityEventType.collaboratorRoleChanged,
            metadata: {
              collaboratorId: result.id,
              collaboratorEmail: result.user.email,
              previousRole: this.permissions.roleToApi(collaborator.role),
              nextRole: this.permissions.roleToApi(result.role)
            }
          }
        });
      }

      return result;
    });

    return this.formatCollaborator(updatedCollaborator);
  }

  async removeCollaborator(
    documentId: string,
    actorId: string,
    collaboratorId: string
  ) {
    await this.assertCanManage(documentId, actorId);

    const collaborator = await this.getCollaborator(documentId, collaboratorId);

    if (collaborator.role === Role.OWNER) {
      throw new HttpError(
        400,
        "OWNER_ROLE_LOCKED",
        "The document owner cannot be removed."
      );
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.activityLog.create({
        data: {
          documentId,
          actorId,
          eventType: ActivityEventType.collaboratorRemoved,
          metadata: {
            collaboratorId: collaborator.id,
            collaboratorEmail: collaborator.user.email,
            role: this.permissions.roleToApi(collaborator.role)
          }
        }
      });

      await transaction.collaborator.delete({
        where: {
          id: collaborator.id
        }
      });
    });

    return { ok: true };
  }

  private async assertCanManage(documentId: string, actorId: string) {
    const role = await this.permissions.getDocumentRole(documentId, actorId);

    if (!role || !this.permissions.canManage(role)) {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "Only the owner can manage collaborators."
      );
    }
  }

  private async getCollaborator(documentId: string, collaboratorId: string) {
    const collaborator = await prisma.collaborator.findFirst({
      where: {
        id: collaboratorId,
        documentId
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

    if (!collaborator) {
      throw new HttpError(
        404,
        "COLLABORATOR_NOT_FOUND",
        "Collaborator not found."
      );
    }

    return collaborator;
  }

  private inputRoleToDb(role: ShareCollaboratorInput["role"]) {
    return role === "editor" ? Role.EDITOR : Role.VIEWER;
  }

  private formatCollaborator(collaborator: CollaboratorWithUser) {
    return {
      id: collaborator.id,
      user: collaborator.user,
      role: this.permissions.roleToApi(collaborator.role),
      createdAt: collaborator.createdAt,
      updatedAt: collaborator.updatedAt
    };
  }
}

export const collaboratorsService = new CollaboratorsService();
