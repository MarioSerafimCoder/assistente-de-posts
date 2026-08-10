import type { ContentProviderId, StructureContentRequest, StructureContentResult } from "@/types/content";
import { createContentCacheKey, getCachedContent, setCachedContent } from "@/lib/content-cache";
import { structuredPostSchema } from "./content-schema";
import { ContentProviderUnavailableError, ContentStructureError, type ContentProvider } from "./content-provider";
import { RulesContentProvider } from "./providers/rules-provider";
import { LocalAIContentProvider } from "./providers/local-ai-provider";
import { OpenAIContentProvider } from "./providers/openai-provider";

const providers: Record<ContentProviderId, ContentProvider> = {
  rules: new RulesContentProvider(),
  local: new LocalAIContentProvider(),
  openai: new OpenAIContentProvider(),
};

export function getContentProvider(id: ContentProviderId): ContentProvider { return providers[id]; }

export async function structureContent(request: StructureContentRequest): Promise<StructureContentResult> {
  const providerId = request.provider ?? "rules";
  const normalizedRequest = { ...request, provider: providerId };
  const cacheKey = createContentCacheKey(normalizedRequest);
  const cached = await getCachedContent(cacheKey);
  if (cached) return { post: cached, provider: providerId, providerUsed: providerId, cached: true };

  const provider = getContentProvider(providerId);
  if (!(await provider.isAvailable())) {
    const message = providerId === "openai"
      ? "A OpenAI não está configurada ou disponível."
      : "A IA local está indisponível. Verifique o LM Studio e o modelo carregado.";
    throw new ContentProviderUnavailableError(providerId, message);
  }
  try {
    const post = structuredPostSchema.parse(await provider.structureContent(normalizedRequest));
    await setCachedContent(cacheKey, post);
    return { post, provider: providerId, providerUsed: providerId, cached: false };
  } catch (error) {
    if (error instanceof ContentProviderUnavailableError) throw error;
    throw new ContentStructureError(providerId, `Não foi possível estruturar a copy com ${provider.name}.`, error);
  }
}
