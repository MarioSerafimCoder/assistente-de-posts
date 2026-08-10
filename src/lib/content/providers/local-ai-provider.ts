import OpenAI from "openai";
import { getTemplatesForBrand } from "@/templates/registry";
import type { StructureContentRequest, StructuredPost } from "@/types/content";
import type { ContentProvider } from "../content-provider";
import { structuredPostSchema } from "../content-schema";
import { buildContentRequestPrompt, CONTENT_EDITOR_PROMPT } from "./ai-shared";

const DEFAULT_BASE_URL = "http://127.0.0.1:1234/v1";
const HEALTH_TIMEOUT_MS = 1_200;

export interface LocalAIStatus { enabled: boolean; connected: boolean; baseURL: string; model: string }

export function getLocalAIConfig() {
  return {
    enabled: process.env.LOCAL_AI_ENABLED === "true",
    baseURL: process.env.LOCAL_AI_BASE_URL || DEFAULT_BASE_URL,
    model: process.env.LOCAL_AI_MODEL || "",
  };
}

export async function getLocalAIStatus(): Promise<LocalAIStatus> {
  const config = getLocalAIConfig();
  if (!config.enabled) return { ...config, connected: false };
  try {
    const response = await fetch(`${config.baseURL.replace(/\/$/, "")}/models`, { signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS), cache: "no-store" });
    return { ...config, connected: response.ok };
  } catch {
    return { ...config, connected: false };
  }
}

export class LocalAIContentProvider implements ContentProvider {
  readonly id = "local" as const;
  readonly name = "IA local";

  async isAvailable(): Promise<boolean> {
    const status = await getLocalAIStatus();
    return status.enabled && status.connected && Boolean(status.model);
  }

  async structureContent(request: StructureContentRequest): Promise<StructuredPost> {
    const config = getLocalAIConfig();
    if (!config.model) throw new Error("LOCAL_AI_MODEL_NOT_CONFIGURED");
    const client = new OpenAI({ apiKey: "local", baseURL: config.baseURL, timeout: 20_000, maxRetries: 0 });
    const completion = await client.chat.completions.create({
      model: config.model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `${CONTENT_EDITOR_PROMPT}\nRetorne somente JSON válido compatível com StructuredPost.` },
        { role: "user", content: buildContentRequestPrompt(request, getTemplatesForBrand(request.brandId)) },
      ],
    });
    const content = completion.choices[0]?.message.content;
    if (!content) throw new Error("LOCAL_AI_EMPTY_RESPONSE");
    const parsed = structuredPostSchema.parse({ ...JSON.parse(content) as Record<string, unknown>, originalCopy: request.copy });
    if (request.requestedFormat === "single" && parsed.slides.length !== 1) throw new Error("INVALID_SINGLE_SLIDE_COUNT");
    if (parsed.slides.length > request.maxSlides) throw new Error("INVALID_SLIDE_COUNT");
    return parsed;
  }
}
