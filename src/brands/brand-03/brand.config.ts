import type { BrandDefinition } from "@/types/brand";
import { granistoneBrand } from "@/brands/granistone/brand.config";

export const brand03: BrandDefinition = {
  ...granistoneBrand,
  id: "brand-03",
  slug: "brand-03",
  name: "Marca 03",
  description: "Estrutura de marca demonstrativa aguardando identidade oficial.",
  colors: { ...granistoneBrand.colors, primary: "#4a2d31", secondary: "#9a7478", accent: "#dbc0bc" },
  logos: { primary: { id: "brand03-logo", name: "Logo pendente", path: "/brands/brand-03/logos/placeholder-dark.svg", placeholder: true } },
};
