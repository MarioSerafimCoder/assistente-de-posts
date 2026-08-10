import { getTemplatesForBrand } from "@/templates/registry";
import type { TextLimit } from "@/types/template";

export interface ContentLimits {
  headline: TextLimit;
  body: TextLimit;
  cta: TextLimit;
}

const defaults: ContentLimits = {
  headline: { recommendedChars: 45, maxChars: 90, maxLines: 4, minFontSize: 42, preferredFontSize: 68, maxFontSize: 82 },
  body: { recommendedChars: 160, maxChars: 360, maxLines: 9, minFontSize: 25, preferredFontSize: 34, maxFontSize: 40 },
  cta: { recommendedChars: 45, maxChars: 80, maxLines: 2, minFontSize: 22, preferredFontSize: 28, maxFontSize: 32 },
};

function largestCapacity(values: (TextLimit | undefined)[], fallback: TextLimit): TextLimit {
  return values.filter((value): value is TextLimit => Boolean(value)).reduce((best, value) =>
    value.maxChars > best.maxChars ? value : best, fallback);
}

export function getContentLimitsForBrand(brandId: string): ContentLimits {
  const templates = getTemplatesForBrand(brandId);
  return {
    headline: largestCapacity(templates.map((item) => item.textLimits.headline), defaults.headline),
    body: largestCapacity(templates.map((item) => item.textLimits.body), defaults.body),
    cta: largestCapacity(templates.map((item) => item.textLimits.cta), defaults.cta),
  };
}
