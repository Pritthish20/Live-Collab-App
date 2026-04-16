import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  documentQueryKey,
  documentsQueryKey
} from "@/features/documents/api/query-keys";
import type { DocumentDetail } from "@/types";
import { apiClient } from "@/utils/api";

type UpdateDocumentInput = {
  documentId: string;
  title: string;
};

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, title }: UpdateDocumentInput) =>
      apiClient.request<DocumentDetail>(`/documents/${documentId}`, {
        method: "PATCH",
        body: JSON.stringify({ title })
      }),
    onSuccess: (document) => {
      queryClient.setQueryData(documentQueryKey(document.id), document);
      queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    }
  });
}
