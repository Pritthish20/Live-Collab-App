import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { User } from "@/types";
import { apiClient } from "@/utils/api";
import { SessionStorage } from "@/utils/session";

type CurrentUserResponse = {
  user: User;
};

export const currentUserQueryKey = ["current-user"] as const;

export function useCurrentUser() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const updateHasToken = () => setHasToken(SessionStorage.hasToken());
    updateHasToken();
    return SessionStorage.subscribe(updateHasToken);
  }, []);

  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: async () => {
      const response = await apiClient.request<CurrentUserResponse>("/auth/me");
      return response.user;
    },
    enabled: hasToken,
    retry: false,
    staleTime: 60 * 1000
  });
}
