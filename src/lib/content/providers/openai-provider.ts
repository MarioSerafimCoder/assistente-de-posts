import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { getTemplatesForBrand } from "@/templates/registry";
import type { StructureContentRequest, StructuredPost } from "@/types/content";
import type { ContentProvider } from "../content-provider";
import { structuredPostOutputSchema } from "../content-schema";
import { buildContentRequestPrompt, CONTENT_EDITOR_PROMPT, normalizeAIOutput } from "./ai-shared";

let client: OpenAI | null = null;

export function getOptionalOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_NOT_CONFIGURED");
  client ??= new OpenAI({ apiKey, timeout: 45_000, maxRetries: 1 });
  return client;
}

export class OpenAIContentProvider implements ContentProvider {
  readonly id = "openai" as const;
  readonly name = "OpenAI";

  async isAvailable(): Promise<boolean> { return Boolean(process.env.OPENAI_API_KEY); }

  async structureContent(request: StructureContentRequest): Promise<StructuredPost> {
    const response = await getOptionalOpenAIClient().responses.parse({
      model: process.env.OPENAI_MODEL || "gpt-5.6-terra",
      reasoning: { effort: (process.env.OPENAI_REASONING_EFFORT || "low") as "none" | "low" | "medium" | "high" | "xhigh" | "max" },
      safety_identifier: "assistente-posts-local-v2",
      input: [
        { role: "developer", content: CONTENT_EDITOR_PROMPT },
        { role: "user", content: buildContentRequestPrompt(request, getTemplatesForBrand(request.brandId)) },
      ],
      text: { format: zodTextFormat(structuredPostOutputSchema, "structured_post") },
    });
    return normalizeAIOutput(structuredPostOutputSchema.parse(response.output_parsed), request);
  }
}
