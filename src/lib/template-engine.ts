import { getTemplatesForBrand } from "@/templates/registry";
import type { StructuredPost, StructuredSlide } from "@/types/content";
import type { TemplateDefinition, TextLimit } from "@/types/template";
import type { SocialOutput, TemplateVariant, TemplateVariantName } from "@/types/template";

export function rankTemplates({ brandId, post, slide }: { brandId: string; post: StructuredPost; slide: StructuredSlide }): TemplateDefinition[] {
  const templates = getTemplatesForBrand(brandId);
  return templates
    .map((template) => {
      let score = 0;
      if (template.slideRoles.includes(slide.role)) score += 8;
      if (template.category === post.contentType) score += 6;
      if (post.recommendedFormat === "carousel" && template.category === "carousel") score += 5;
      score += template.tags.filter((tag) => post.templateTags?.includes(tag)).length * 2;
      if (slide.imageQuery && template.tags.includes("imagem")) score += 3;
      const bodyLength = slide.body?.length ?? 0;
      if (bodyLength <= (template.textLimits.body?.maxChars ?? Infinity)) score += 2;
      return { template, score };
    })
    .sort((a, b) => b.score - a.score || a.template.id.localeCompare(b.template.id))
    .map(({ template }) => template);
}

export function fitTextToTemplate(text: string | undefined, limit: TextLimit | undefined): { fontSize: number; overflow: boolean } {
  if (!limit || !text) return { fontSize: limit?.preferredFontSize ?? 32, overflow: false };
  const ratio = Math.max(1, text.length / limit.recommendedChars);
  const fontSize = Math.max(limit.minFontSize, Math.min(limit.maxFontSize, Math.round(limit.preferredFontSize / Math.sqrt(ratio))));
  return { fontSize, overflow: text.length > limit.maxChars };
}

export function resolveFeedStoryVariant(template: TemplateDefinition, output: SocialOutput, requested: TemplateVariantName, hasImage: boolean): TemplateVariant {
  const variants = template.variants[output];
  return variants.find((variant) => variant.name === requested && (!variant.requiresImage || hasImage))
    ?? variants.find((variant) => !variant.requiresImage)
    ?? variants[0];
}
