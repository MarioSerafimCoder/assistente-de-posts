import type { TemplateDefinition, TemplateVariant, TextLimit } from "@/types/template";

const headline: TextLimit = { recommendedChars: 45, maxChars: 90, maxLines: 4, minFontSize: 42, preferredFontSize: 68, maxFontSize: 82 };
const body: TextLimit = { recommendedChars: 160, maxChars: 360, maxLines: 9, minFontSize: 25, preferredFontSize: 34, maxFontSize: 40 };
const cta: TextLimit = { recommendedChars: 45, maxChars: 80, maxLines: 2, minFontSize: 22, preferredFontSize: 28, maxFontSize: 32 };

function variants(template: string, layout: TemplateVariant["layout"]): TemplateDefinition["variants"] {
  return {
    feed: [
      { id: `${template}-feed-light`, name: "light", output: "feed", background: "light", layout },
      { id: `${template}-feed-dark`, name: "dark", output: "feed", background: "dark", layout },
      { id: `${template}-feed-image`, name: "image", output: "feed", background: "dark", layout: "image-led", requiresImage: true },
    ],
    story: [
      { id: `${template}-story-light`, name: "light", output: "story", background: "light", layout },
      { id: `${template}-story-dark`, name: "dark", output: "story", background: "dark", layout },
      { id: `${template}-story-image`, name: "image", output: "story", background: "dark", layout: "image-led", requiresImage: true },
    ],
  };
}

export const granistoneTemplates: TemplateDefinition[] = [
  { id: "institutional-01", brandId: "granistone", name: "Institucional Essencial", category: "institutional", slideRoles: ["cover", "content"], tags: ["minimalista", "institucional", "texto-curto"], variants: variants("institutional-01", "split"), textLimits: { headline, body, cta } },
  { id: "institutional-02", brandId: "granistone", name: "Institucional Central", category: "institutional", slideRoles: ["cover", "quote", "content"], tags: ["central", "manifesto", "editorial"], variants: variants("institutional-02", "centered"), textLimits: { headline, body, cta } },
  { id: "editorial-01", brandId: "granistone", name: "Editorial Marcador", category: "editorial", slideRoles: ["cover", "content", "list", "quote"], tags: ["editorial", "número", "conteúdo"], variants: variants("editorial-01", "numbered"), textLimits: { headline, body, cta } },
  { id: "product-01", brandId: "granistone", name: "Produto em Foco", category: "product", slideRoles: ["cover", "image", "content"], tags: ["produto", "imagem", "textura"], variants: variants("product-01", "image-led"), textLimits: { headline, body, cta } },
  { id: "carousel-01", brandId: "granistone", name: "Carrossel Sequencial", category: "carousel", slideRoles: ["cover", "content", "list", "quote", "cta"], tags: ["carrossel", "sequencial", "educacional"], variants: variants("carousel-01", "editorial"), textLimits: { headline, body, cta } },
  { id: "cta-01", brandId: "granistone", name: "Chamada Direta", category: "commercial", slideRoles: ["cta", "content", "cover"], tags: ["cta", "comercial", "conversão"], variants: variants("cta-01", "cta"), textLimits: { headline, body, cta } },
];
