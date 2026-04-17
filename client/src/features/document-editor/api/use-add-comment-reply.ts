import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  documentActivityQueryKey,
  documentCommentsQueryKey
} from "@/features/documents/api/query-keys";
import type { CommentThread } from "@/types";
import { apiClient } from "@/utils/api";

type AddCommentReplyInput = {
  documentId: string;
  threadId: string;
  body: string;
};

export function useAddCommentReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, threadId, body }: AddCommentReplyInput) =>
      apiClient.request<CommentThread>(
        `/documents/${documentId}/comments/${threadId}/replies`,
        {
          method: "POST",
          body: JSON.stringify({
            body
          })
        }
      ),
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
