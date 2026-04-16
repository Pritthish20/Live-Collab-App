import { useMutation, useQueryClient } from "@tanstack/react-query";
import { currentUserQueryKey } from "@/features/auth/session/api/use-current-user";
import type { User } from "@/types";
import { apiClient } from "@/utils/api";
import { SessionStorage } from "@/utils/session";

type LoginInput = {
  email: string;
  password: string;
};

type LoginResponse = {
  user: User;
  token: string;
};

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiClient.request<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input)
      }),
    onSuccess: (result) => {
      SessionStorage.setToken(result.token);
      queryClient.setQueryData(currentUserQueryKey, result.user);
    }
  });
}
