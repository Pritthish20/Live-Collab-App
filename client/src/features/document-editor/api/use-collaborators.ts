import { useQuery } from "@tanstack/react-query";
import { documentCollaboratorsQueryKey } from "@/features/documents/api/query-keys";
import type { Collaborator } from "@/types";
import { apiClient } from "@/utils/api";

export { documentCollaboratorsQueryKey };

export function useCollaborators(documentId: string, enabled = true) {
  return useQuery({
    queryKey: documentCollaboratorsQueryKey(documentId),
    queryFn: () =>
      apiClient.request<Collaborator[]>(`/documents/${documentId}/collaborators`),
    enabled
  });
}
