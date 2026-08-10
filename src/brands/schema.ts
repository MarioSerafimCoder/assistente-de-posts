import { z } from "zod";

const color = z.string().regex(/^#[0-9a-f]{6}$/i, "Use uma cor hexadecimal com 6 dígitos");
const asset = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  placeholder: z.boolean().optional(),
});
const typography = z.object({
  family: z.string().min(1),
  fallback: z.string().min(1),
  weights: z.array(z.number().int().min(100).max(900)).min(1),
  localSources: z.array(z.object({
    path: z.string().min(1),
    weight: z.number().int().min(100).max(900),
    style: z.enum(["normal", "italic"]).optional(),
  })).optional(),
});

export const brandDefinitionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string(),
  colors: z.object({
    primary: color,
    secondary: color.optional(),
    accent: color.optional(),
    background: color,
    surface: color.optional(),
    light: color,
    dark: color,
    additional: z.record(z.string(), color).optional(),
  }),
  logos: z.object({
    primary: asset,
    color: asset.optional(),
    white: asset.optional(),
    black: asset.optional(),
    monochrome: asset.optional(),
    horizontal: asset.optional(),
    vertical: asset.optional(),
    symbol: asset.optional(),
  }),
  typography: z.object({
    headline: typography,
    subheadline: typography.optional(),
    body: typography,
    cta: typography.optional(),
  }),
  assets: z.array(asset.extend({
    type: z.enum(["pattern", "texture", "shape", "icon", "frame", "seal", "background", "illustration"]),
    contexts: z.array(z.string()).optional(),
    variants: z.array(z.string()).optional(),
    preferredPositions: z.array(z.enum(["top-left", "top-right", "bottom-left", "bottom-right", "center", "background"])).optional(),
    recolorable: z.boolean().optional(),
    allowedColors: z.array(color).optional(),
    opacity: z.object({ min: z.number().min(0).max(1), max: z.number().min(0).max(1) }).optional(),
  })),
  images: z.array(asset.extend({
    tags: z.array(z.string()),
    categories: z.array(z.enum(["product", "architecture", "institutional", "people", "lifestyle", "background"])).optional(),
  })),
  imageStyle: z.object({ preferred: z.array(z.string()), avoid: z.array(z.string()) }).optional(),
  rules: z.object({ logoRules: z.array(z.string()).optional(), visualRules: z.array(z.string()).optional() }),
  templates: z.array(z.string()).min(1),
});
