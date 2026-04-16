import { useQuery } from "@tanstack/react-query";
import { documentsQueryKey } from "@/features/documents/api/query-keys";
import type { DocumentSummary } from "@/types";
import { apiClient } from "@/utils/api";

export function useDocuments() {
  return useQuery({
    queryKey: documentsQueryKey,
    queryFn: () => apiClient.request<DocumentSummary[]>("/documents")
  });
}
