import { brands } from "@/brands";
import type { TemplateDefinition } from "@/types/template";
import { templateDefinitionSchema } from "./types";
import { granistoneTemplates } from "./granistone/definitions";

const all: TemplateDefinition[] = brands.flatMap((brand) =>
  granistoneTemplates.map((template) => ({ ...template, brandId: brand.id }))
);

export const templateRegistry = all.map((template) => templateDefinitionSchema.parse(template) as TemplateDefinition);

export function getTemplatesForBrand(brandId: string): TemplateDefinition[] {
  return templateRegistry.filter((template) => template.brandId === brandId);
}

export function getTemplate(brandId: string, templateId: string): TemplateDefinition | null {
  return templateRegistry.find((template) => template.brandId === brandId && template.id === templateId) ?? null;
}
