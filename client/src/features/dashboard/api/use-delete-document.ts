import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  documentQueryKey,
  documentsQueryKey
} from "@/features/documents/api/query-keys";
import { apiClient } from "@/utils/api";

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) =>
      apiClient.request<{ ok: boolean }>(`/documents/${documentId}`, {
        method: "DELETE"
      }),
    onSuccess: (_data, documentId) => {
      queryClient.removeQueries({ queryKey: documentQueryKey(documentId) });
      queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    }
  });
}
