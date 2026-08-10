import { z } from "zod";

export const structuredSlideSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["cover", "content", "list", "quote", "image", "cta"]),
  headline: z.string().max(90).optional(),
  subheadline: z.string().max(140).optional(),
  body: z.string().max(360).optional(),
  cta: z.string().max(80).optional(),
  visualIntent: z.string().max(160).optional(),
  imageQuery: z.string().max(120).optional(),
  keywords: z.array(z.string().max(40)).max(8).optional(),
});

export const structuredPostSchema = z.object({
  language: z.string().min(2).max(20),
  contentType: z.enum(["institutional", "product", "commercial", "editorial", "informational", "commemorative", "other"]),
  recommendedFormat: z.enum(["single", "carousel"]),
  title: z.string().max(100).optional(),
  originalCopy: z.string().min(1),
  slides: z.array(structuredSlideSchema).min(1).max(10),
  imageQueries: z.array(z.string().max(120)).max(10).optional(),
  templateTags: z.array(z.string().max(40)).max(10).optional(),
});

// Responses API Structured Outputs requires every property to be present.
// Nullable transport fields are normalized back to optional app fields server-side.
export const structuredPostOutputSchema = z.object({
  language: z.string().min(2).max(20),
  contentType: z.enum(["institutional", "product", "commercial", "editorial", "informational", "commemorative", "other"]),
  recommendedFormat: z.enum(["single", "carousel"]),
  title: z.string().max(100).nullable(),
  originalCopy: z.string().min(1),
  slides: z.array(z.object({
    id: z.string().min(1),
    role: z.enum(["cover", "content", "list", "quote", "image", "cta"]),
    headline: z.string().max(90).nullable(),
    subheadline: z.string().max(140).nullable(),
    body: z.string().max(360).nullable(),
    cta: z.string().max(80).nullable(),
    visualIntent: z.string().max(160).nullable(),
    imageQuery: z.string().max(120).nullable(),
    keywords: z.array(z.string().max(40)).max(8).nullable(),
  })).min(1).max(10),
  imageQueries: z.array(z.string().max(120)).max(10).nullable(),
  templateTags: z.array(z.string().max(40)).max(10).nullable(),
});

export const structureContentRequestSchema = z.object({
  brandId: z.string().min(1),
  copy: z.string().min(3).max(12000),
  requestedFormat: z.enum(["auto", "single", "carousel"]),
  outputs: z.array(z.enum(["feed", "story"])).min(1),
  maxSlides: z.number().int().min(1).max(10).default(8),
  preserveCopy: z.boolean().default(true),
});

export type StructuredPostInput = z.infer<typeof structuredPostSchema>;
