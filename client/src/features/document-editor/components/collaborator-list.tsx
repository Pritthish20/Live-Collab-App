"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleAccess } from "@/features/documents/utils/role-access";
import type { Collaborator, CollaboratorRole } from "@/types";
import { useRemoveCollaborator } from "../api/use-remove-collaborator";
import { useUpdateCollaboratorRole } from "../api/use-update-collaborator-role";

type EditableRole = Exclude<CollaboratorRole, "owner">;

type CollaboratorListProps = {
  collaborators: Collaborator[];
  documentId: string;
};

export function CollaboratorList({
  collaborators,
  documentId
}: CollaboratorListProps) {
  const updateRole = useUpdateCollaboratorRole();
  const removeCollaborator = useRemoveCollaborator();

  if (collaborators.length === 0) {
    return <p className="muted">No collaborators yet.</p>;
  }

  return (
    <div className="collaborator-list">
      {collaborators.map((collaborator) => {
        const isOwner = RoleAccess.canManage(collaborator.role);
        const isUpdating =
          updateRole.isPending &&
          updateRole.variables?.collaboratorId === collaborator.id;
        const isRemoving =
          removeCollaborator.isPending &&
          removeCollaborator.variables?.collaboratorId === collaborator.id;

        return (
          <article className="collaborator-row" key={collaborator.id}>
            <div className="collaborator-main">
              <strong>{collaborator.user.name}</strong>
              <span className="muted">{collaborator.user.email}</span>
            </div>
            <div className="collaborator-controls">
              {isOwner ? (
                <Badge>{RoleAccess.label(collaborator.role)}</Badge>
              ) : (
                <select
                  className="input role-select"
                  aria-label={`Role for ${collaborator.user.name}`}
                  value={collaborator.role}
                  disabled={isUpdating || isRemoving}
                  onChange={(event) =>
                    updateRole.mutate({
                      documentId,
                      collaboratorId: collaborator.id,
                      role: event.target.value as EditableRole
                    })
                  }
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              )}
              <Button
                type="button"
                variant="secondary"
                disabled={isOwner || isRemoving}
                onClick={() =>
                  removeCollaborator.mutate({
                    documentId,
                    collaboratorId: collaborator.id
                  })
                }
              >
                Remove
              </Button>
            </div>
          </article>
        );
      })}
      {updateRole.error ? (
        <p className="error">{updateRole.error.message}</p>
      ) : null}
      {removeCollaborator.error ? (
        <p className="error">{removeCollaborator.error.message}</p>
      ) : null}
    </div>
  );
}
