import { useMutation } from "@tanstack/react-query";
import type { AiDocumentReport } from "@/types";
import { apiClient } from "@/utils/api";

type GenerateAiReportInput = {
  documentId: string;
};

export function useGenerateAiReport() {
  return useMutation({
    mutationFn: ({ documentId }: GenerateAiReportInput) =>
      apiClient.request<AiDocumentReport>(`/documents/${documentId}/ai/report`, {
        method: "POST",
        body: JSON.stringify({})
      })
  });
}
