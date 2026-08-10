"use client";

import { SlideRenderer } from "@/components/editor/SlideRenderer";
import { renderGenerationSlide } from "@/lib/visual-engine";
import type { BrandDefinition } from "@/types/brand";
import type { GenerationSlide } from "@/types/generation";
import type { TemplateDefinition } from "@/types/template";

export function BrandTemplatePreviews({ brand, templates }: { brand: BrandDefinition; templates: TemplateDefinition[] }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{templates.map((template, index) => {
    const slide: GenerationSlide = { id: template.id, order: index, content: { id: template.id, role: index === templates.length - 1 ? "cta" : "cover", headline: template.name, body: "Template demonstrativo pronto para receber o conteúdo estruturado.", cta: index === templates.length - 1 ? "Conheça mais" : undefined }, templateId: template.id, alternatives: [], variant: index % 2 ? "light" : "dark", logoVariant: "auto", imagePosition: { x: 50, y: 50 } };
    return <div key={template.id} className="rounded-xl border border-white/10 bg-white/[.03] p-3"><div className="h-56 overflow-hidden rounded-lg bg-black/20"><SlideRenderer html={renderGenerationSlide({ brand, slide, output: "feed" })} aspectRatio="4:5" className="h-full w-full"/></div><div className="mt-3"><h3 className="text-sm font-semibold">{template.name}</h3><p className="mt-1 text-[11px] text-white/40">Feed 4:5 · Story 9:16 · {template.variants.feed.length} variantes</p></div></div>;
  })}</div>;
}
