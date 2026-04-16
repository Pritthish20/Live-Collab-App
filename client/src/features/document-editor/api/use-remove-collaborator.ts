import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  documentCollaboratorsQueryKey,
  documentsQueryKey
} from "@/features/documents/api/query-keys";
import { apiClient } from "@/utils/api";

type RemoveCollaboratorInput = {
  documentId: string;
  collaboratorId: string;
};

export function useRemoveCollaborator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, collaboratorId }: RemoveCollaboratorInput) =>
      apiClient.request<{ ok: boolean }>(
        `/documents/${documentId}/collaborators/${collaboratorId}`,
        {
          method: "DELETE"
        }
      ),
    onSuccess: (_result, input) => {
      queryClient.invalidateQueries({
        queryKey: documentCollaboratorsQueryKey(input.documentId)
      });
      queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    }
  });
}
