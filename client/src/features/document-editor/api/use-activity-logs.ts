import { useQuery } from "@tanstack/react-query";
import { documentActivityQueryKey } from "@/features/documents/api/query-keys";
import type { ActivityLogEntry } from "@/types";
import { apiClient } from "@/utils/api";

export { documentActivityQueryKey };

export function useActivityLogs(documentId: string) {
  return useQuery({
    queryKey: documentActivityQueryKey(documentId),
    queryFn: () =>
      apiClient.request<ActivityLogEntry[]>(`/documents/${documentId}/activity`)
  });
}
