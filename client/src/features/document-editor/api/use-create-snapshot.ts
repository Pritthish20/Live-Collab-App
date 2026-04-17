import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  documentActivityQueryKey,
  documentQueryKey,
  documentSnapshotsQueryKey,
  documentsQueryKey
} from "@/features/documents/api/query-keys";
import type { Snapshot } from "@/types";
import { apiClient } from "@/utils/api";

type CreateSnapshotInput = {
  documentId: string;
  title?: string;
};

export function useCreateSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, title }: CreateSnapshotInput) =>
      apiClient.request<Snapshot>(`/documents/${documentId}/snapshots`, {
        method: "POST",
        body: JSON.stringify({
          title
        })
      }),
    onSuccess: (_snapshot, input) => {
      queryClient.invalidateQueries({
        queryKey: documentSnapshotsQueryKey(input.documentId)
      });
      queryClient.invalidateQueries({
        queryKey: documentActivityQueryKey(input.documentId)
      });
      queryClient.invalidateQueries({
        queryKey: documentQueryKey(input.documentId)
      });
      queryClient.invalidateQueries({
        queryKey: documentsQueryKey
      });
    }
  });
}
