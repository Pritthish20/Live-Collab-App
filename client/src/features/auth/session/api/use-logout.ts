import { useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsQueryKey } from "@/features/documents/api/query-keys";
import { apiClient } from "@/utils/api";
import { SessionStorage } from "@/utils/session";
import { currentUserQueryKey } from "./use-current-user";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.request<{ ok: boolean }>("/auth/logout", {
        method: "POST"
      }),
    onSettled: () => {
      SessionStorage.clearToken();
      queryClient.removeQueries({ queryKey: currentUserQueryKey });
      queryClient.removeQueries({ queryKey: documentsQueryKey });
    }
  });
}
