import { Config } from "./config";
import { SessionStorage } from "./session";

type ApiEnvelope<T> = {
  data: T | null;
  error: { code: string; message: string } | null;
};

export class ApiClient {
  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = SessionStorage.getToken();
    const response = await fetch(`${Config.apiUrl}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });

    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const payload = isJson
      ? ((await response.json()) as ApiEnvelope<T>)
      : ({
          data: null,
          error: {
            code: "REQUEST_FAILED",
            message: response.statusText || "Request failed"
          }
        } satisfies ApiEnvelope<T>);

    if (response.status === 401) {
      SessionStorage.clearToken();
    }

    if (!response.ok || payload.error) {
      throw new Error(payload.error?.message ?? "Request failed");
    }

    return payload.data as T;
  }
}

export const apiClient = new ApiClient();
