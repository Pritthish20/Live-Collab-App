import { useQuery } from "@tanstack/react-query";
import { documentSnapshotsQueryKey } from "@/features/documents/api/query-keys";
import type { Snapshot } from "@/types";
import { apiClient } from "@/utils/api";

export { documentSnapshotsQueryKey };

export function useSnapshots(documentId: string) {
  return useQuery({
    queryKey: documentSnapshotsQueryKey(documentId),
    queryFn: () =>
      apiClient.request<Snapshot[]>(`/documents/${documentId}/snapshots`)
  });
}
