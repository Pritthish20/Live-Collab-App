import { useQuery } from "@tanstack/react-query";
import { documentQueryKey } from "@/features/documents/api/query-keys";
import type { DocumentDetail } from "@/types";
import { apiClient } from "@/utils/api";

export { documentQueryKey };

export function useDocument(documentId: string) {
  return useQuery({
    queryKey: documentQueryKey(documentId),
    queryFn: () => apiClient.request<DocumentDetail>(`/documents/${documentId}`)
  });
}
