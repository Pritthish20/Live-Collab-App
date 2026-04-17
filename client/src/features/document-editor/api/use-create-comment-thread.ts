import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  documentActivityQueryKey,
  documentCommentsQueryKey
} from "@/features/documents/api/query-keys";
import type { CommentAnchor, CommentThread } from "@/types";
import { apiClient } from "@/utils/api";

type CreateCommentThreadInput = {
  documentId: string;
  body: string;
  quote?: string;
  anchor?: CommentAnchor;
};

export function useCreateCommentThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, body, quote, anchor }: CreateCommentThreadInput) =>
      apiClient.request<CommentThread>(`/documents/${documentId}/comments`, {
        method: "POST",
        body: JSON.stringify({
          body,
          quote,
          anchor
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
