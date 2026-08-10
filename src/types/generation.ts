import type { StructuredPost, StructuredSlide } from "./content";
import type { LogoVariant } from "./brand";
import type { SocialOutput, TemplateVariantName } from "./template";

export interface GenerationSlide {
  id: string;
  order: number;
  content: StructuredSlide;
  templateId: string;
  alternatives: string[];
  variant: TemplateVariantName;
  logoVariant: LogoVariant;
  imageUrl?: string;
  imagePosition: { x: number; y: number };
}

export interface Generation {
  id: string;
  name: string;
  brandId: string;
  originalCopy: string;
  outputs: SocialOutput[];
  structuredPost: StructuredPost;
  slides: GenerationSlide[];
  createdAt: string;
  updatedAt: string;
}

export interface GenerationsData { generations: Generation[] }
