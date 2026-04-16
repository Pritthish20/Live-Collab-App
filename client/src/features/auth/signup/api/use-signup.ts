import { useMutation, useQueryClient } from "@tanstack/react-query";
import { currentUserQueryKey } from "@/features/auth/session/api/use-current-user";
import type { User } from "@/types";
import { apiClient } from "@/utils/api";
import { SessionStorage } from "@/utils/session";

type SignupInput = {
  name: string;
  email: string;
  password: string;
};

type SignupResponse = {
  user: User;
  token: string;
};

export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignupInput) =>
      apiClient.request<SignupResponse>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(input)
      }),
    onSuccess: (result) => {
      SessionStorage.setToken(result.token);
      queryClient.setQueryData(currentUserQueryKey, result.user);
    }
  });
}
