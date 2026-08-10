import { z } from "zod";

const textLimit = z.object({
  recommendedChars: z.number().int().positive(),
  maxChars: z.number().int().positive(),
  maxLines: z.number().int().positive(),
  minFontSize: z.number().positive(),
  preferredFontSize: z.number().positive(),
  maxFontSize: z.number().positive(),
});

const variant = z.object({
  id: z.string(),
  name: z.enum(["light", "dark", "image", "accent"]),
  output: z.enum(["feed", "story"]),
  background: z.enum(["light", "dark", "primary", "accent"]),
  layout: z.enum(["split", "editorial", "centered", "numbered", "image-led", "cta"]),
  requiresImage: z.boolean().optional(),
});

export const templateDefinitionSchema = z.object({
  id: z.string().min(1),
  brandId: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(["institutional", "product", "commercial", "editorial", "informational", "commemorative", "carousel"]),
  slideRoles: z.array(z.enum(["cover", "content", "list", "quote", "image", "cta"])).min(1),
  tags: z.array(z.string()),
  variants: z.object({ feed: z.array(variant).min(1), story: z.array(variant).min(1) }),
  textLimits: z.object({
    headline: textLimit.optional(), subheadline: textLimit.optional(), body: textLimit.optional(), cta: textLimit.optional(),
  }),
});
