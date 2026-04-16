import { useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsQueryKey } from "@/features/documents/api/query-keys";
import type { DocumentSummary } from "@/types";
import { apiClient } from "@/utils/api";

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) =>
      apiClient.request<DocumentSummary>("/documents", {
        method: "POST",
        body: JSON.stringify({ title })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    }
  });
}
