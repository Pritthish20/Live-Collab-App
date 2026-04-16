import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  documentCollaboratorsQueryKey,
  documentsQueryKey
} from "@/features/documents/api/query-keys";
import type { Collaborator, CollaboratorRole } from "@/types";
import { apiClient } from "@/utils/api";

type ShareDocumentInput = {
  documentId: string;
  email: string;
  role: Exclude<CollaboratorRole, "owner">;
};

export function useShareDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, email, role }: ShareDocumentInput) =>
      apiClient.request<Collaborator>(`/documents/${documentId}/share`, {
        method: "POST",
        body: JSON.stringify({ email, role })
      }),
    onSuccess: (_collaborator, input) => {
      queryClient.invalidateQueries({
        queryKey: documentCollaboratorsQueryKey(input.documentId)
      });
      queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    }
  });
}
