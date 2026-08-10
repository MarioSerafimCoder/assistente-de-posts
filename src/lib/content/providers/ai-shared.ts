import type { StructureContentRequest, StructuredPost } from "@/types/content";
import type { TemplateDefinition } from "@/types/template";
import { structuredPostSchema } from "../content-schema";

export const CONTENT_EDITOR_PROMPT = `Você é um editor de conteúdo para social media.
Transforme a copy em conteúdo estruturado para templates aprovados. Não crie design.
Nunca invente fatos, números, nomes, datas, produtos, CTAs ou alegações.
Quando preserveCopy=true, mantenha texto, mensagem e significado; faça somente hierarquia e separação.
requestedFormat=single exige exatamente um slide. requestedFormat=carousel divide o conteúdo logicamente.
Não elimine conteúdo silenciosamente e não force uma quantidade artificial de slides.`;

export function buildContentRequestPrompt(request: StructureContentRequest, templates: TemplateDefinition[]): string {
  return JSON.stringify({
    task: "Estruture a copy no schema StructuredPost",
    brandId: request.brandId,
    requestedFormat: request.requestedFormat,
    maxSlides: request.maxSlides,
    preserveCopy: request.preserveCopy,
    copy: request.copy,
    availableTemplateLimits: templates.slice(0, 3).map(({ id, textLimits }) => ({ id, textLimits })),
    rules: [
      `slides deve ter no máximo ${request.maxSlides} itens`,
      request.requestedFormat === "single" ? "slides deve ter exatamente 1 item" : "não force quantidade de slides",
      "originalCopy deve reproduzir exatamente a copy recebida",
      "campos desconhecidos podem ser omitidos; não invente texto para preenchê-los",
    ],
  });
}

type NullablePost = {
  language: string;
  contentType: StructuredPost["contentType"];
  recommendedFormat: StructuredPost["recommendedFormat"];
  title: string | null;
  originalCopy: string;
  slides: Array<{ id: string; role: StructuredPost["slides"][number]["role"]; headline: string | null; subheadline: string | null; body: string | null; cta: string | null; visualIntent: string | null; imageQuery: string | null; keywords: string[] | null }>;
  imageQueries: string[] | null;
  templateTags: string[] | null;
  contentOverflow: boolean | null;
  overflowReason: string | null;
};

export function normalizeAIOutput(value: NullablePost, request: StructureContentRequest): StructuredPost {
  const normalized = {
    ...value,
    originalCopy: request.copy,
    title: value.title ?? undefined,
    imageQueries: value.imageQueries ?? undefined,
    templateTags: value.templateTags ?? undefined,
    contentOverflow: value.contentOverflow ?? undefined,
    overflowReason: value.overflowReason ?? undefined,
    slides: value.slides.map((item) => Object.fromEntries(Object.entries(item).filter(([, field]) => field !== null))),
  };
  const parsed = structuredPostSchema.parse(normalized);
  if (request.requestedFormat === "single" && parsed.slides.length !== 1) throw new Error("INVALID_SINGLE_SLIDE_COUNT");
  if (parsed.slides.length > request.maxSlides) throw new Error("INVALID_SLIDE_COUNT");
  return parsed;
}
