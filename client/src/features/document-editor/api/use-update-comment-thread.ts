import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  documentActivityQueryKey,
  documentCommentsQueryKey
} from "@/features/documents/api/query-keys";
import type { CommentStatus, CommentThread } from "@/types";
import { apiClient } from "@/utils/api";

type UpdateCommentThreadInput = {
  documentId: string;
  threadId: string;
  status: CommentStatus;
};

export function useUpdateCommentThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, threadId, status }: UpdateCommentThreadInput) =>
      apiClient.request<CommentThread>(`/documents/${documentId}/comments/${threadId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status
        })
      }),
    onSuccess: (_thread, input) => {
      queryClient.invalidateQueries({
        queryKey: documentCommentsQueryKey(input.documentId)
      });
      queryClient.invalidateQueries({
        queryKey: documentActivityQueryKey(input.documentId)
      });
    }
  });
}
