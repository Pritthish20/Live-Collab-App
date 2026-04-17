import { useQuery } from "@tanstack/react-query";
import { documentCommentsQueryKey } from "@/features/documents/api/query-keys";
import type { CommentThread } from "@/types";
import { apiClient } from "@/utils/api";

export { documentCommentsQueryKey };

export function useComments(documentId: string) {
  return useQuery({
    queryKey: documentCommentsQueryKey(documentId),
    queryFn: () =>
      apiClient.request<CommentThread[]>(`/documents/${documentId}/comments`)
  });
}
