import type { TemplateDefinition, TextLimit } from "@/types/template";

const headline: TextLimit = { recommendedChars: 52, maxChars: 88, maxLines: 4, minFontSize: 52, preferredFontSize: 72, maxFontSize: 82 };
const body: TextLimit = { recommendedChars: 105, maxChars: 165, maxLines: 4, minFontSize: 20, preferredFontSize: 25, maxFontSize: 29 };
const cta: TextLimit = { recommendedChars: 24, maxChars: 48, maxLines: 2, minFontSize: 18, preferredFontSize: 22, maxFontSize: 25 };

export const vertiTemplates: TemplateDefinition[] = [{
  id: "verti-option-01",
  brandId: "brand-02",
  name: "Verti · Opção 01",
  category: "institutional",
  slideRoles: ["cover", "content", "image", "cta"],
  tags: ["verti", "opção-01", "imagem", "técnico", "segurança", "texto-curto"],
  variants: {
    feed: [
      { id: "verti-option-01-feed-image", name: "image", output: "feed", background: "primary", layout: "verti-option-01", requiresImage: true },
      { id: "verti-option-01-feed-dark", name: "dark", output: "feed", background: "primary", layout: "verti-option-01" },
    ],
    story: [
      { id: "verti-option-01-story-image", name: "image", output: "story", background: "primary", layout: "verti-option-01", requiresImage: true },
      { id: "verti-option-01-story-dark", name: "dark", output: "story", background: "primary", layout: "verti-option-01" },
    ],
  },
  textLimits: { headline, body, cta },
}];
