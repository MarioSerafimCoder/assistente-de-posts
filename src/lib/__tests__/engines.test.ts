import { describe, expect, it } from "vitest";
import { brandDefinitionSchema } from "../../brands/schema";
import { granistoneBrand } from "../../brands/granistone/brand.config";
import { resolveLogoVariant } from "../brand-engine";
import { rankTemplates, resolveFeedStoryVariant } from "../template-engine";
import { structuredPostSchema } from "../openai/content-schema";
import { createContentCacheKey } from "../content-cache";
import { sanitizeFileName } from "../filename";
import { getTemplate } from "../../templates/registry";
import type { StructuredPost } from "../../types/content";

const post: StructuredPost = {
  language: "pt-BR", contentType: "institutional", recommendedFormat: "single", originalCopy: "Matéria e permanência.",
  slides: [{ id: "1", role: "cover", headline: "Matéria e permanência." }], templateTags: ["institucional"],
};

describe("Brand e Content Engine", () => {
  it("valida o Brand Kit demonstrativo", () => { expect(brandDefinitionSchema.safeParse(granistoneBrand).success).toBe(true); });
  it("resolve logo branca em fundo escuro", () => { expect(resolveLogoVariant({ brand: granistoneBrand, backgroundColor: "#171a18" }).variant).toBe("white"); });
  it("prioriza template compatível", () => { expect(rankTemplates({ brandId: "granistone", post, slide: post.slides[0] })[0].id).toMatch(/institutional/); });
  it("valida StructuredPost", () => { expect(structuredPostSchema.safeParse(post).success).toBe(true); });
  it("gera cache key estável e sensível à copy", () => {
    const base = { brandId: "granistone", copy: "A", requestedFormat: "auto" as const, outputs: ["feed" as const], maxSlides: 8, preserveCopy: true };
    expect(createContentCacheKey(base)).toBe(createContentCacheKey({ ...base }));
    expect(createContentCacheKey(base)).not.toBe(createContentCacheKey({ ...base, copy: "B" }));
  });
  it("sanitiza nomes de arquivo", () => { expect(sanitizeFileName("Granistone — Nova Coleção / 2026")).toBe("granistone-nova-colecao-2026"); });
  it("usa fallback sem imagem em Feed e mantém variante Story independente", () => {
    const template = getTemplate("granistone", "product-01")!;
    expect(resolveFeedStoryVariant(template, "feed", "image", false).requiresImage).not.toBe(true);
    expect(resolveFeedStoryVariant(template, "story", "dark", false).output).toBe("story");
  });
});
