import type { BrandDefinition } from "@/types/brand";
import { granistoneBrand } from "@/brands/granistone/brand.config";

export const brand02: BrandDefinition = {
  ...granistoneBrand,
  id: "brand-02",
  slug: "brand-02",
  name: "Marca 02",
  description: "Estrutura de marca demonstrativa aguardando identidade oficial.",
  colors: { ...granistoneBrand.colors, primary: "#26344a", secondary: "#72829a", accent: "#b7c5dc" },
  logos: { primary: { id: "brand02-logo", name: "Logo pendente", path: "/brands/brand-02/logos/placeholder-dark.svg", placeholder: true } },
};
