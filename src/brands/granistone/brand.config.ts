import type { BrandDefinition } from "@/types/brand";

export const granistoneBrand: BrandDefinition = {
  id: "granistone",
  slug: "granistone",
  name: "Granistone",
  description: "Kit demonstrativo neutro. Substitua os placeholders pelos assets oficiais da marca.",
  colors: {
    primary: "#27342f",
    secondary: "#9b8c74",
    accent: "#d7c7a7",
    background: "#f1efe9",
    surface: "#e5e1d8",
    light: "#faf9f6",
    dark: "#171a18",
  },
  logos: {
    primary: { id: "logo-primary", name: "Logo demonstrativo", path: "/brands/granistone/logos/placeholder-dark.svg", placeholder: true },
    white: { id: "logo-white", name: "Logo branco demonstrativo", path: "/brands/granistone/logos/placeholder-white.svg", placeholder: true },
    black: { id: "logo-black", name: "Logo preto demonstrativo", path: "/brands/granistone/logos/placeholder-dark.svg", placeholder: true },
  },
  typography: {
    headline: { family: "Arial", fallback: "sans-serif", weights: [600, 700] },
    body: { family: "Arial", fallback: "sans-serif", weights: [400, 500] },
    cta: { family: "Arial", fallback: "sans-serif", weights: [600] },
  },
  assets: [{
    id: "demo-grid", name: "Grid demonstrativo", type: "pattern",
    path: "/brands/granistone/elements/demo-grid.svg", placeholder: true,
    contexts: ["institutional", "editorial"], preferredPositions: ["background"], recolorable: true,
    allowedColors: ["#d7c7a7", "#27342f"], opacity: { min: 0.06, max: 0.18 },
  }],
  images: [],
  imageStyle: {
    preferred: ["arquitetura contemporânea", "luz natural", "texturas minerais", "composição sóbria"],
    avoid: ["logos", "texto na imagem", "cores artificiais", "aparência plástica"],
  },
  rules: {
    logoRules: ["fundos escuros usam logo branca", "fundos claros usam logo principal ou preta"],
    visualRules: ["usar apenas elementos explicitamente associados ao template", "não simular identidade oficial"],
  },
  templates: ["institutional-01", "institutional-02", "editorial-01", "product-01", "carousel-01", "cta-01"],
};
