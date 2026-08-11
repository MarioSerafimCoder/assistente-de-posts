import type { BrandAsset, BrandDefinition, LogoVariant } from "@/types/brand";
import type { TemplateVariant } from "@/types/template";

function luminance(hex: string): number {
  const rgb = hex.slice(1).match(/.{2}/g)?.map((part) => parseInt(part, 16) / 255) ?? [0, 0, 0];
  const linear = rgb.map((value) => value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export function resolveLogoVariant({
  brand, backgroundColor, requestedVariant = "auto",
}: {
  brand: BrandDefinition;
  template?: TemplateVariant;
  backgroundColor: string;
  requestedVariant?: LogoVariant;
}): { variant: LogoVariant; asset: BrandAsset } {
  const requested = requestedVariant === "auto"
    ? (luminance(backgroundColor) < 0.42 ? "white" : "primary")
    : requestedVariant;
  const asset = brand.logos[requested] ?? brand.logos.primary;
  return { variant: requested, asset };
}

export function getBrandFontFaceCss(brand: BrandDefinition): string {
  const definitions = [brand.typography.headline, brand.typography.subheadline, brand.typography.body, brand.typography.cta];
  const declarations = new Map<string, string>();

  for (const definition of definitions) {
    if (!definition) continue;
    for (const source of definition.localSources ?? []) {
      const style = source.style ?? "normal";
      const key = `${definition.family}:${source.path}:${source.weight}:${style}`;
      const format = source.path.endsWith(".woff2") ? "woff2" : source.path.endsWith(".woff") ? "woff" : source.path.endsWith(".otf") ? "opentype" : "truetype";
      declarations.set(key, `@font-face{font-family:'${definition.family}';src:url('${source.path}') format('${format}');font-weight:${source.weight};font-style:${style};font-display:block;}`);
    }
  }

  return [...declarations.values()].join("");
}
