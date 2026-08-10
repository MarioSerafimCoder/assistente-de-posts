import type { BrandDefinition } from "@/types/brand";
import { brandDefinitionSchema } from "./schema";
import { granistoneBrand } from "./granistone/brand.config";
import { brand02 } from "./brand-02/brand.config";
import { brand03 } from "./brand-03/brand.config";

const candidates = [granistoneBrand, brand02, brand03];

export const brands: BrandDefinition[] = candidates.flatMap((candidate) => {
  const parsed = brandDefinitionSchema.safeParse(candidate);
  if (!parsed.success) {
    console.error(`Brand configuration invalid: ${candidate.slug}`, parsed.error.issues);
    return [];
  }
  return [parsed.data as BrandDefinition];
});

export function getBrand(idOrSlug: string): BrandDefinition | null {
  return brands.find((brand) => brand.id === idOrSlug || brand.slug === idOrSlug) ?? null;
}
