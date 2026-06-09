import { useMutation } from "@tanstack/react-query";
import type { AiCommentsSummary } from "@/types";
import { apiClient } from "@/utils/api";

type SummarizeCommentsInput = {
  documentId: string;
};

export function useSummarizeComments() {
  return useMutation({
    mutationFn: ({ documentId }: SummarizeCommentsInput) =>
      apiClient.request<AiCommentsSummary>(
        `/documents/${documentId}/ai/comments-summary`,
        {
          method: "POST",
          body: JSON.stringify({})
        }
      )
  });
}
