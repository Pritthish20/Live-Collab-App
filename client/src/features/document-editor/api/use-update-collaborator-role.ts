import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  documentCollaboratorsQueryKey,
  documentsQueryKey
} from "@/features/documents/api/query-keys";
import type { Collaborator, CollaboratorRole } from "@/types";
import { apiClient } from "@/utils/api";

type UpdateCollaboratorRoleInput = {
  documentId: string;
  collaboratorId: string;
  role: Exclude<CollaboratorRole, "owner">;
};

export function useUpdateCollaboratorRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      collaboratorId,
      role
    }: UpdateCollaboratorRoleInput) =>
      apiClient.request<Collaborator>(
        `/documents/${documentId}/collaborators/${collaboratorId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ role })
        }
      ),
    onSuccess: (_collaborator, input) => {
      queryClient.invalidateQueries({
        queryKey: documentCollaboratorsQueryKey(input.documentId)
      });
      queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    }
  });
}
