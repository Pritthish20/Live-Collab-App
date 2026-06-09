import { useMutation } from "@tanstack/react-query";
import type { AiDocumentReport } from "@/types";
import { Config } from "@/utils/config";
import { SessionStorage } from "@/utils/session";

type DownloadAiReportPdfInput = {
  documentId: string;
  report: AiDocumentReport;
};

export function useDownloadAiReportPdf() {
  return useMutation({
    mutationFn: async ({ documentId, report }: DownloadAiReportPdfInput) => {
      const token = SessionStorage.getToken();
      const response = await fetch(
        `${Config.apiUrl}/documents/${documentId}/ai/report/pdf`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(report)
        }
      );

      if (!response.ok) {
        await throwPdfError(response);
      }

      const blob = await response.blob();
      const fileName = getFileName(response) ?? "collabpad-ai-report.pdf";
      downloadBlob(blob, fileName);
    }
  });
}

async function throwPdfError(response: Response): Promise<never> {
  let message = "PDF download failed.";

  try {
    const payload = (await response.json()) as {
      error?: { message?: string };
    };
    message = payload.error?.message ?? message;
  } catch {
    // Binary or non-JSON error responses still surface a useful fallback.
  }

  throw new Error(message);
}

function getFileName(response: Response) {
  const disposition = response.headers.get("content-disposition");
  const match = disposition?.match(/filename="([^"]+)"/i);

  return match?.[1] ?? null;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}
