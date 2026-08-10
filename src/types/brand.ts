export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
}

export interface BrandFonts {
  heading: string;
  body: string;
}

export interface CustomFont {
  name: string;
  path: string;
}

export interface BrandConfig {
  name: string;
  colors: BrandColors;
  fonts: BrandFonts;
  customFonts: CustomFont[];
  logoPath: string | null;
  styleKeywords: string[];
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_BRAND: BrandConfig = {
  name: "",
  colors: {
    primary: "#1a1a2e",
    secondary: "#16213e",
    accent: "#e94560",
    background: "#ffffff",
    surface: "#f5f5f5",
  },
  fonts: {
    heading: "Inter",
    body: "Inter",
  },
  customFonts: [],
  logoPath: null,
  styleKeywords: [],
  createdAt: "",
  updatedAt: "",
};

export type LogoVariant = "auto" | "primary" | "color" | "white" | "black" | "monochrome";

export interface BrandAsset {
  id: string;
  name: string;
  path: string;
  placeholder?: boolean;
}

export interface TypographyDefinition {
  family: string;
  fallback: string;
  weights: number[];
  localSources?: { path: string; weight: number; style?: "normal" | "italic" }[];
}

export interface BrandVisualAsset extends BrandAsset {
  type: "pattern" | "texture" | "shape" | "icon" | "frame" | "seal" | "background" | "illustration";
  contexts?: string[];
  variants?: string[];
  preferredPositions?: ("top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" | "background")[];
  recolorable?: boolean;
  allowedColors?: string[];
  opacity?: { min: number; max: number };
}

export interface BrandImage extends BrandAsset {
  tags: string[];
  categories?: ("product" | "architecture" | "institutional" | "people" | "lifestyle" | "background")[];
}

export interface BrandDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary?: string;
    accent?: string;
    background: string;
    surface?: string;
    light: string;
    dark: string;
    additional?: Record<string, string>;
  };
  logos: {
    primary: BrandAsset;
    color?: BrandAsset;
    white?: BrandAsset;
    black?: BrandAsset;
    monochrome?: BrandAsset;
    horizontal?: BrandAsset;
    vertical?: BrandAsset;
    symbol?: BrandAsset;
  };
  typography: {
    headline: TypographyDefinition;
    subheadline?: TypographyDefinition;
    body: TypographyDefinition;
    cta?: TypographyDefinition;
  };
  assets: BrandVisualAsset[];
  images: BrandImage[];
  imageStyle?: { preferred: string[]; avoid: string[] };
  rules: { logoRules?: string[]; visualRules?: string[] };
  templates: string[];
}
