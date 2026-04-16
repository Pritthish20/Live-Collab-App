import { z } from "zod";

export class CollaboratorsSchema {
  static role = z.enum(["editor", "viewer"]);

  static share = z.object({
    email: z.string().trim().email().toLowerCase(),
    role: CollaboratorsSchema.role
  });

  static updateRole = z.object({
    role: CollaboratorsSchema.role
  });
}

export type ShareCollaboratorInput = z.infer<typeof CollaboratorsSchema.share>;
export type UpdateCollaboratorRoleInput = z.infer<
  typeof CollaboratorsSchema.updateRole
>;
