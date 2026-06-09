import { env } from "../config/env.js";
import { HttpError } from "../utils/errors.js";

type AiGenerateJsonInput = {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

type AiErrorResponse = {
  error?: {
    message?: string;
  };
};

export class AiProviderService {
  async generateJson(input: AiGenerateJsonInput) {
    if (env.AI_PROVIDER === "gemini") {
      return this.generateGeminiJson(input);
    }

    throw new HttpError(
      501,
      "AI_PROVIDER_NOT_IMPLEMENTED",
      `AI provider "${env.AI_PROVIDER}" is not implemented yet.`
    );
  }

  private async generateGeminiJson(input: AiGenerateJsonInput) {
    if (!env.AI_API_KEY) {
      throw new HttpError(
        503,
        "AI_PROVIDER_NOT_CONFIGURED",
        "AI provider API key is not configured."
      );
    }

    const baseUrl =
      env.AI_BASE_URL ?? "https://generativelanguage.googleapis.com";
    const response = await fetch(
      `${baseUrl}/v1beta/models/${encodeURIComponent(
        env.AI_MODEL
      )}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.AI_API_KEY
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: input.systemPrompt
              }
            ]
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: input.userPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: input.temperature ?? 0.2,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      await this.throwProviderError(response);
    }

    const payload = (await response.json()) as GeminiGenerateContentResponse;
    const text = this.getGeminiText(payload);

    return this.parseJson(text);
  }

  private getGeminiText(payload: GeminiGenerateContentResponse) {
    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) {
      throw new HttpError(
        502,
        "AI_EMPTY_RESPONSE",
        "AI provider returned an empty response."
      );
    }

    return text;
  }

  private parseJson(text: string) {
    const normalized = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      return JSON.parse(normalized) as unknown;
    } catch {
      throw new HttpError(
        502,
        "AI_INVALID_RESPONSE",
        "AI provider returned invalid JSON."
      );
    }
  }

  private async throwProviderError(response: Response): Promise<never> {
    const payload = (await this.readErrorPayload(response)) as AiErrorResponse;
    const providerMessage = payload.error?.message ?? response.statusText;

    if (response.status === 429) {
      throw new HttpError(
        429,
        "AI_RATE_LIMITED",
        "AI provider rate limit reached. Try again later."
      );
    }

    throw new HttpError(
      502,
      "AI_PROVIDER_ERROR",
      providerMessage || "AI provider request failed."
    );
  }

  private async readErrorPayload(response: Response) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }
}

export const aiProviderService = new AiProviderService();
