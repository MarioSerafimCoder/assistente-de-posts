import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { getTemplatesForBrand } from "@/templates/registry";
import type { StructureContentRequest, StructuredPost } from "@/types/content";
import { createContentCacheKey, getCachedContent, setCachedContent } from "@/lib/content-cache";
import { getOpenAIClient } from "./client";
import { structuredPostOutputSchema, structuredPostSchema } from "./content-schema";
import { buildContentRequestPrompt, CONTENT_EDITOR_PROMPT } from "./prompts";

export async function structureContent(request: StructureContentRequest): Promise<{ post: StructuredPost; cached: boolean }> {
  const cacheKey = createContentCacheKey(request);
  const cached = await getCachedContent(cacheKey);
  if (cached) return { post: cached, cached: true };

  const openai = getOpenAIClient();
  const model = process.env.OPENAI_MODEL || "gpt-5.6-terra";
  const effort = (process.env.OPENAI_REASONING_EFFORT || "low") as "none" | "low" | "medium" | "high" | "xhigh" | "max";
  const requestId = crypto.randomUUID();
  const started = Date.now();
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await openai.responses.parse({
        model,
        reasoning: { effort },
        safety_identifier: "assistente-posts-local-v1",
        input: [
          { role: "developer", content: CONTENT_EDITOR_PROMPT },
          { role: "user", content: `${buildContentRequestPrompt(request, getTemplatesForBrand(request.brandId))}${attempt ? "\nA tentativa anterior não passou na validação. Corrija estritamente o schema e as regras." : ""}` },
        ],
        text: { format: zodTextFormat(structuredPostOutputSchema, "structured_post") },
      });
      const transport = structuredPostOutputSchema.parse(response.output_parsed);
      const normalized = {
        ...transport,
        title: transport.title ?? undefined,
        imageQueries: transport.imageQueries ?? undefined,
        templateTags: transport.templateTags ?? undefined,
        slides: transport.slides.map((slide) => ({
          ...slide,
          headline: slide.headline ?? undefined,
          subheadline: slide.subheadline ?? undefined,
          body: slide.body ?? undefined,
          cta: slide.cta ?? undefined,
          visualIntent: slide.visualIntent ?? undefined,
          imageQuery: slide.imageQuery ?? undefined,
          keywords: slide.keywords ?? undefined,
        })),
      };
      const parsed = structuredPostSchema.safeParse(normalized);
      if (!parsed.success) throw new Error("INVALID_STRUCTURED_OUTPUT");
      const post = { ...parsed.data, originalCopy: request.copy } as StructuredPost;
      if (request.requestedFormat === "single" && post.slides.length !== 1) throw new Error("INVALID_SINGLE_SLIDE_COUNT");
      if (post.slides.length > request.maxSlides) post.slides = post.slides.slice(0, request.maxSlides);
      await setCachedContent(cacheKey, post);
      console.info("content.structured", { requestId, model, latencyMs: Date.now() - started, attempt: attempt + 1, schemaValid: true, usage: response.usage });
      return { post, cached: false };
    } catch (error) {
      lastError = error;
      if (error instanceof OpenAI.AuthenticationError || error instanceof OpenAI.RateLimitError || error instanceof OpenAI.APIConnectionTimeoutError) throw error;
      console.warn("content.structure.retry", { requestId, model, attempt: attempt + 1, schemaValid: false, error: error instanceof Error ? error.name : "unknown", message: error instanceof Error ? error.message : "unknown" });
    }
  }
  throw lastError instanceof Error ? lastError : new Error("INVALID_STRUCTURED_OUTPUT");
}
