import type { BrandDefinition } from "@/types/brand";
import type { GenerationSlide } from "@/types/generation";
import type { SocialOutput, TemplateVariant } from "@/types/template";
import { getTemplate } from "@/templates/registry";
import { fitTextToTemplate, resolveFeedStoryVariant } from "./template-engine";
import { getBrandFontFaceCss, resolveLogoVariant } from "./brand-engine";

export function escapeHtml(value: string | undefined): string {
  return (value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char] ?? char));
}

function backgroundFor(brand: BrandDefinition, variant: TemplateVariant): string {
  if (variant.background === "dark") return brand.colors.dark;
  if (variant.background === "primary") return brand.colors.primary;
  if (variant.background === "accent") return brand.colors.accent ?? brand.colors.secondary ?? brand.colors.primary;
  return brand.colors.light;
}

export function renderGenerationSlide({ brand, slide, output }: { brand: BrandDefinition; slide: GenerationSlide; output: SocialOutput }): string {
  const template = getTemplate(brand.id, slide.templateId) ?? getTemplate(brand.id, "institutional-01");
  if (!template) throw new Error("Template não encontrado");
  const selected = resolveFeedStoryVariant(template, output, slide.variant, Boolean(slide.imageUrl));
  const background = backgroundFor(brand, selected);
  const dark = selected.background !== "light";
  const foreground = dark ? brand.colors.light : brand.colors.dark;
  const accent = dark ? (brand.colors.accent ?? brand.colors.light) : brand.colors.primary;
  const logo = resolveLogoVariant({ brand, template: selected, backgroundColor: background, requestedVariant: slide.logoVariant });
  const headlineFit = fitTextToTemplate(slide.content.headline, template.textLimits.headline);
  const bodyFit = fitTextToTemplate(slide.content.body, template.textLimits.body);
  const dimension = output === "feed" ? { width: 1080, height: 1350 } : { width: 1080, height: 1920 };
  const headline = escapeHtml(slide.content.headline);
  const subheadline = escapeHtml(slide.content.subheadline);
  const body = escapeHtml(slide.content.body).replace(/\n/g, "<br>");
  const cta = escapeHtml(slide.content.cta);
  const image = slide.imageUrl ? `<div class="photo" role="img" aria-label="Imagem selecionada"></div>` : "";
  const overflow = headlineFit.overflow || bodyFit.overflow;
  const number = String(slide.order + 1).padStart(2, "0");
  const logoHtml = `<img class="logo" src="${escapeHtml(logo.asset.path)}" alt="${escapeHtml(brand.name)}${logo.asset.placeholder ? " — logo demonstrativo" : ""}">`;
  const contentHtml = `<div class="eyebrow">${escapeHtml(slide.content.role)} · ${number}</div>${headline ? `<h1>${headline}</h1>` : ""}${subheadline ? `<h2>${subheadline}</h2>` : ""}${body ? `<p>${body}</p>` : ""}${cta ? `<div class="cta">${cta}<span>→</span></div>` : ""}${overflow ? `<div class="overflow-warning">Texto acima do limite do template</div>` : ""}`;

  return `<style>
${getBrandFontFaceCss(brand)}
.slide{position:relative;width:${dimension.width}px;height:${dimension.height}px;overflow:hidden;background:${background};color:${foreground};font-family:'${brand.typography.body.family}',${brand.typography.body.fallback};}
.pattern{position:absolute;inset:0;background-image:url('/brands/granistone/elements/demo-grid.svg');background-size:240px;opacity:.14;mix-blend-mode:${dark ? "screen" : "multiply"};}
.frame{position:absolute;inset:${output === "feed" ? 52 : 64}px;border:1px solid ${accent};opacity:.65;pointer-events:none;}
.content{position:absolute;z-index:3;display:flex;flex-direction:column;justify-content:center;gap:${output === "feed" ? 28 : 34}px;}
.eyebrow{font-size:22px;letter-spacing:.24em;text-transform:uppercase;color:${accent};font-weight:700;}
h1{font-family:'${brand.typography.headline.family}',${brand.typography.headline.fallback};font-size:${headlineFit.fontSize}px;line-height:.98;letter-spacing:-.045em;max-width:820px;white-space:pre-line;}
h2{font-size:${output === "feed" ? 30 : 34}px;line-height:1.25;font-weight:500;max-width:720px;color:${dark ? "#ffffffcc" : "#171a18bb"};}
p{font-size:${bodyFit.fontSize}px;line-height:1.35;max-width:720px;color:${dark ? "#ffffffd9" : "#171a18d9"};}
.cta{display:flex;align-items:center;justify-content:space-between;gap:24px;width:max-content;max-width:620px;padding:18px 24px;border:1px solid ${accent};font-size:26px;font-weight:700;color:${accent};}
.logo{position:absolute;z-index:4;object-fit:contain;width:260px;height:60px;left:${output === "feed" ? 78 : 84}px;bottom:${output === "feed" ? 72 : 96}px;object-position:left center;}
.photo{position:absolute;inset:0;background-image:linear-gradient(180deg,transparent 30%,${background}ee 88%),url('${escapeHtml(slide.imageUrl)}');background-size:cover;background-position:${slide.imagePosition.x}% ${slide.imagePosition.y}%;}
.overflow-warning{font-size:18px;color:#ffcf70;border-left:4px solid #ffcf70;padding-left:12px;}
.layout-split .content{left:80px;right:80px;top:180px;bottom:220px;border-left:14px solid ${accent};padding-left:54px;}
.layout-centered .content{inset:180px 110px 260px;text-align:center;align-items:center;}.layout-centered h1,.layout-centered p{max-width:780px;}
.layout-editorial .content{left:90px;right:160px;top:${output === "feed" ? 260 : 430}px;bottom:260px;}.layout-editorial:after{content:'${number}';position:absolute;right:70px;top:70px;font-size:220px;line-height:1;font-weight:800;color:${accent};opacity:.16;}
.layout-numbered .content{left:90px;right:100px;top:300px;bottom:240px;}.layout-numbered:before{content:'${number}';position:absolute;left:74px;top:65px;font-size:170px;font-weight:800;color:${accent};}
.layout-image-led .content{left:80px;right:80px;bottom:${output === "feed" ? 220 : 270}px;justify-content:flex-end;text-shadow:0 2px 28px #0009;}.layout-image-led .eyebrow,.layout-image-led .cta{color:#fff;border-color:#fff;}.layout-image-led{color:#fff;}
.layout-cta .content{inset:190px 90px 260px;align-items:flex-start;justify-content:flex-end;}.layout-cta h1{font-size:${Math.min(headlineFit.fontSize + 10, 92)}px;}
  </style><main class="slide layout-${selected.layout}">${selected.layout === "image-led" ? image : ""}<div class="pattern"></div><div class="frame"></div><section class="content">${contentHtml}</section>${logoHtml}</main>`;
}
