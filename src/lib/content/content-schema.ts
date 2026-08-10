import { z } from "zod";

const optionalText = (maximum: number) => z.string().max(maximum).optional();

export const structuredSlideSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["cover", "content", "list", "quote", "image", "cta"]),
  headline: optionalText(500),
  subheadline: optionalText(1000),
  body: optionalText(12000),
  cta: optionalText(500),
  visualIntent: optionalText(500),
  imageQuery: optionalText(300),
  keywords: z.array(z.string().max(80)).max(12).optional(),
});

export const structuredPostSchema = z.object({
  language: z.string().min(2).max(20),
  contentType: z.enum(["institutional", "product", "commercial", "editorial", "informational", "commemorative", "other"]),
  recommendedFormat: z.enum(["single", "carousel"]),
  title: optionalText(500),
  originalCopy: z.string().min(1).max(12000),
  slides: z.array(structuredSlideSchema).min(1).max(10),
  imageQueries: z.array(z.string().max(300)).max(10).optional(),
  templateTags: z.array(z.string().max(80)).max(12).optional(),
  contentOverflow: z.boolean().optional(),
  overflowReason: optionalText(500),
});

// Structured Outputs exige propriedades presentes; o provider converte null em undefined.
export const structuredPostOutputSchema = z.object({
  language: z.string().min(2).max(20),
  contentType: z.enum(["institutional", "product", "commercial", "editorial", "informational", "commemorative", "other"]),
  recommendedFormat: z.enum(["single", "carousel"]),
  title: z.string().max(500).nullable(),
  originalCopy: z.string().min(1).max(12000),
  slides: z.array(z.object({
    id: z.string().min(1),
    role: z.enum(["cover", "content", "list", "quote", "image", "cta"]),
    headline: z.string().max(500).nullable(),
    subheadline: z.string().max(1000).nullable(),
    body: z.string().max(12000).nullable(),
    cta: z.string().max(500).nullable(),
    visualIntent: z.string().max(500).nullable(),
    imageQuery: z.string().max(300).nullable(),
    keywords: z.array(z.string().max(80)).max(12).nullable(),
  })).min(1).max(10),
  imageQueries: z.array(z.string().max(300)).max(10).nullable(),
  templateTags: z.array(z.string().max(80)).max(12).nullable(),
  contentOverflow: z.boolean().nullable(),
  overflowReason: z.string().max(500).nullable(),
});

export const structureContentRequestSchema = z.object({
  brandId: z.string().min(1),
  copy: z.string().trim().min(1, "Digite ou cole uma copy antes de gerar.").max(12000),
  requestedFormat: z.enum(["auto", "single", "carousel"]),
  outputs: z.array(z.enum(["feed", "story"])).min(1),
  maxSlides: z.number().int().min(1).max(10).default(8),
  preserveCopy: z.boolean().default(true),
  provider: z.enum(["rules", "local", "openai"]).default("rules"),
});

export type StructuredPostInput = z.infer<typeof structuredPostSchema>;
