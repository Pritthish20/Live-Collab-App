import type { DocumentRole } from "@/types";

export class RoleAccess {
  static canEdit(role: DocumentRole | null | undefined) {
    return role === "owner" || role === "editor";
  }

  static canManage(role: DocumentRole | null | undefined) {
    return role === "owner";
  }

  static canRename(role: DocumentRole | null | undefined) {
    return this.canEdit(role);
  }

  static canDelete(role: DocumentRole | null | undefined) {
    return this.canManage(role);
  }

  static canShare(role: DocumentRole | null | undefined) {
    return this.canManage(role);
  }

  static isReadOnly(role: DocumentRole | null | undefined) {
    return role === "viewer";
  }

  static label(role: DocumentRole) {
    const labels: Record<DocumentRole, string> = {
      owner: "Owner",
      editor: "Editor",
      viewer: "Viewer"
    };

    return labels[role];
  }

  static description(role: DocumentRole) {
    const descriptions: Record<DocumentRole, string> = {
      owner: "You can edit, delete, and manage access.",
      editor: "You can edit this document.",
      viewer: "You can read this document."
    };

    return descriptions[role];
  }
}
