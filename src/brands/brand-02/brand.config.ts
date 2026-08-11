import type { BrandDefinition } from "@/types/brand";

const montExtraLight = { path: "/brands/brand-02/fonts/mont/Mont-ExtraLight.woff2", weight: 200 };
const montRegular = { path: "/brands/brand-02/fonts/mont/Mont-Regular.woff2", weight: 400 };
const montSemiBold = { path: "/brands/brand-02/fonts/mont/Mont-SemiBold.woff2", weight: 600 };
const montHeavy = { path: "/brands/brand-02/fonts/mont/Mont-Heavy.woff2", weight: 800 };

export const brand02: BrandDefinition = {
  id: "brand-02",
  slug: "brand-02",
  name: "Verti",
  description: "Identidade visual da Verti para comunicação técnica, segurança e trabalhos em altura.",
  colors: {
    primary: "#083838",
    secondary: "#00514f",
    accent: "#a4e839",
    background: "#083838",
    surface: "#0c4746",
    light: "#f4f6f3",
    dark: "#042f30",
    additional: { lime: "#a4e839", "deep-green": "#083838" },
  },
  logos: {
    primary: { id: "verti-logo-primary", name: "Verti branca", path: "/brands/brand-02/logos/verti-white.png" },
    white: { id: "verti-logo-white", name: "Verti branca", path: "/brands/brand-02/logos/verti-white.png" },
    horizontal: { id: "verti-logo-horizontal", name: "Verti horizontal branca", path: "/brands/brand-02/logos/verti-white.png" },
  },
  typography: {
    headline: { family: "Mont", fallback: "Arial, sans-serif", weights: [800], localSources: [montHeavy] },
    subheadline: { family: "Mont", fallback: "Arial, sans-serif", weights: [400, 600], localSources: [montRegular, montSemiBold] },
    body: { family: "Mont", fallback: "Arial, sans-serif", weights: [200, 400], localSources: [montExtraLight, montRegular] },
    cta: { family: "Mont", fallback: "Arial, sans-serif", weights: [600, 800], localSources: [montSemiBold, montHeavy] },
  },
  assets: [
    { id: "verti-bg-option-01-feed", name: "Fundo Opção 01 Feed", type: "background", path: "/brands/brand-02/backgrounds/option-01-feed.png", contexts: ["feed", "option-01"], preferredPositions: ["background"] },
    { id: "verti-bg-option-01-story", name: "Fundo Opção 01 Stories", type: "background", path: "/brands/brand-02/backgrounds/option-01-story.png", contexts: ["story", "option-01"], preferredPositions: ["background"] },
    { id: "verti-accent-line", name: "Linha tricolor", type: "shape", path: "/brands/brand-02/elements/accent-line.png", contexts: ["option-01"], preferredPositions: ["top-left"] },
    { id: "verti-outline-frame", name: "Moldura curva neon", type: "frame", path: "/brands/brand-02/elements/outline-frame.png", contexts: ["option-01"], preferredPositions: ["top-right", "bottom-right"] },
  ],
  images: [{
    id: "verti-option-01-placeholder", name: "Placeholder de serviço em altura",
    path: "/brands/brand-02/images/option-01-placeholder.svg", placeholder: true,
    tags: ["trabalho em altura", "iluminação", "serviço técnico", "segurança"],
    categories: ["institutional", "people"],
  }],
  imageStyle: {
    preferred: ["trabalho em altura", "atividade técnica real", "equipamento de segurança", "enquadramento vertical", "luz natural"],
    avoid: ["pessoa sem EPI", "imagem genérica de escritório", "texto embutido na fotografia", "cores que conflitem com verde Verti"],
  },
  rules: {
    logoRules: ["usar a logo branca sobre o fundo verde-petróleo", "preservar área de respiro ao redor da marca"],
    visualRules: ["headline combina branco e verde neon", "fotografia ocupa a faixa central", "texto de apoio usa cápsula branca", "manter a faixa neon inferior do fundo"],
  },
  templates: ["verti-option-01"],
};
