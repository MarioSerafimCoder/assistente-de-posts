import type { ContentProvider } from "../content-provider";
import type { StructureContentRequest, StructuredPost, StructuredSlide } from "@/types/content";
import { getContentLimitsForBrand } from "../content-limits";
import { classifyContent } from "../rules/content-classifier";
import { parseCopy } from "../rules/copy-parser";
import { countListItems } from "../rules/list-detector";
import { removeQuoteLabel } from "../rules/quote-detector";
import { extractKeywords } from "../rules/keyword-extractor";
import { regroupUnits, splitCarouselContent } from "../rules/carousel-splitter";

const AUTO_SINGLE_MAX_CHARS = 350;
const AUTO_SINGLE_MAX_BLOCKS = 2;
const AUTO_LARGE_LIST_ITEMS = 4;

function slide(id: number, role: StructuredSlide["role"], values: Omit<StructuredSlide, "id" | "role">): StructuredSlide {
  return { id: `slide-${id}`, role, ...values };
}

export class RulesContentProvider implements ContentProvider {
  readonly id = "rules" as const;
  readonly name = "Sem IA";

  async isAvailable(): Promise<boolean> { return true; }

  async structureContent(request: StructureContentRequest): Promise<StructuredPost> {
    const limits = getContentLimitsForBrand(request.brandId);
    const parsed = parseCopy(request.copy, limits.headline.maxChars, limits.cta.maxChars);
    const contentType = classifyContent(parsed.normalized);
    const keywords = extractKeywords(parsed.normalized);
    const relevantBlocks = parsed.blocks.filter(Boolean);
    const autoSingle = parsed.normalized.length <= AUTO_SINGLE_MAX_CHARS
      && relevantBlocks.length <= AUTO_SINGLE_MAX_BLOCKS
      && countListItems(parsed.normalized) < AUTO_LARGE_LIST_ITEMS;
    const recommendedFormat = request.requestedFormat === "single" ? "single"
      : request.requestedFormat === "carousel" ? "carousel"
      : autoSingle ? "single" : "carousel";

    let slides: StructuredSlide[];
    let overflow = false;

    if (recommendedFormat === "single") {
      const body = relevantBlocks.join("\n\n") || undefined;
      overflow = Boolean((parsed.headline?.length ?? 0) > limits.headline.maxChars
        || (body?.length ?? 0) > limits.body.maxChars
        || (parsed.cta?.length ?? 0) > limits.cta.maxChars);
      slides = [slide(1, parsed.cta && !body && !parsed.headline ? "cta" : "cover", {
        headline: parsed.headline,
        subheadline: parsed.subheadline,
        body,
        cta: parsed.cta,
        keywords,
      })];
    } else {
      let units = splitCarouselContent(relevantBlocks, limits.body.maxChars);
      const reserveCover = Boolean(parsed.headline);
      const reserveCta = Boolean(parsed.cta);
      if (!reserveCover && units.length) {
        const first = units.shift()!;
        const useAsHeadline = first.text.length <= limits.headline.maxChars;
        slides = [slide(1, "cover", useAsHeadline
          ? { headline: first.text, subheadline: parsed.subheadline, keywords: extractKeywords(first.text) }
          : { body: first.text, subheadline: parsed.subheadline, keywords: extractKeywords(first.text) })];
        overflow ||= first.overflow;
      } else {
        slides = reserveCover ? [slide(1, "cover", { headline: parsed.headline, subheadline: parsed.subheadline, keywords })] : [];
      }

      const bodySlots = Math.max(0, request.maxSlides - slides.length - Number(reserveCta));
      if (bodySlots === 0 && units.length) {
        overflow = true;
        const target = slides.at(-1);
        if (target) target.body = [target.body, ...units.map((item) => item.text)].filter(Boolean).join("\n\n");
        units = [];
      }
      if (units.length > bodySlots) overflow = true;
      const grouped = regroupUnits(units, bodySlots, limits.body.maxChars);
      grouped.forEach((unit) => {
        overflow ||= unit.overflow;
        slides.push(slide(slides.length + 1, unit.role, {
          body: unit.role === "quote" ? removeQuoteLabel(unit.text) : unit.text,
          keywords: extractKeywords(unit.text),
        }));
      });
      if (parsed.cta && slides.length < request.maxSlides) slides.push(slide(slides.length + 1, "cta", { cta: parsed.cta, keywords: extractKeywords(parsed.cta) }));
      else if (parsed.cta) {
        overflow = true;
        const last = slides.at(-1);
        if (last) last.cta = parsed.cta;
      }
      if (!slides.length) slides = [slide(1, "cover", { body: parsed.normalized, keywords })];
    }

    const roles = [...new Set(slides.map((item) => item.role))];
    return {
      language: "pt-BR",
      contentType,
      recommendedFormat,
      title: parsed.headline,
      originalCopy: request.copy,
      slides,
      imageQueries: keywords.length ? [keywords.slice(0, 4).join(" ")] : undefined,
      templateTags: [contentType, recommendedFormat, ...roles],
      contentOverflow: overflow || undefined,
      overflowReason: overflow ? "O conteúdo foi preservado, mas ultrapassa o limite recomendado de um ou mais templates." : undefined,
    };
  }
}
