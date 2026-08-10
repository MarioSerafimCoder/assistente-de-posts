import type { AspectRatio, Slide } from "./carousel";
import type { ContentType, SlideRole, StructuredSlide } from "./content";
import type { LogoVariant } from "./brand";

export interface Template {
  id: string;
  name: string;
  description: string;
  aspectRatio: AspectRatio;
  slides: Omit<Slide, "previousVersions">[];
  tags: string[];
  createdAt: string;
}

export interface TemplatesData {
  templates: Template[];
}

export type SocialOutput = "feed" | "story";
export type TemplateVariantName = "light" | "dark" | "image" | "accent";

export interface TextLimit {
  recommendedChars: number;
  maxChars: number;
  maxLines: number;
  minFontSize: number;
  preferredFontSize: number;
  maxFontSize: number;
}

export interface TemplateVariant {
  id: string;
  name: TemplateVariantName;
  output: SocialOutput;
  background: "light" | "dark" | "primary" | "accent";
  layout: "split" | "editorial" | "centered" | "numbered" | "image-led" | "cta";
  requiresImage?: boolean;
}

export interface TemplateDefinition {
  id: string;
  brandId: string;
  name: string;
  category: Exclude<ContentType, "other"> | "carousel";
  slideRoles: SlideRole[];
  tags: string[];
  variants: { feed: TemplateVariant[]; story: TemplateVariant[] };
  textLimits: {
    headline?: TextLimit;
    subheadline?: TextLimit;
    body?: TextLimit;
    cta?: TextLimit;
  };
}

export interface RenderedSlideDefinition {
  templateId: string;
  output: SocialOutput;
  variant: TemplateVariantName;
  logoVariant: LogoVariant;
  imageUrl?: string;
  imagePosition?: { x: number; y: number };
  content: StructuredSlide;
}
