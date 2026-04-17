import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  documentActivityQueryKey,
  documentCommentsQueryKey,
  documentQueryKey,
  documentSnapshotsQueryKey,
  documentsQueryKey
} from "@/features/documents/api/query-keys";
import type { SnapshotRestoreResult } from "@/types";
import { apiClient } from "@/utils/api";

type RestoreSnapshotInput = {
  documentId: string;
  snapshotId: string;
};

export function useRestoreSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, snapshotId }: RestoreSnapshotInput) =>
      apiClient.request<SnapshotRestoreResult>(
        `/documents/${documentId}/snapshots/${snapshotId}/restore`,
        {
          method: "POST"
        }
      ),
    onSuccess: (_result, input) => {
      queryClient.invalidateQueries({
        queryKey: documentSnapshotsQueryKey(input.documentId)
      });
      queryClient.invalidateQueries({
        queryKey: documentActivityQueryKey(input.documentId)
      });
      queryClient.invalidateQueries({
        queryKey: documentCommentsQueryKey(input.documentId)
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
