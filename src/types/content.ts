export type ContentType = "institutional" | "product" | "commercial" | "editorial" | "informational" | "commemorative" | "other";
export type RequestedFormat = "auto" | "single" | "carousel";
export type SlideRole = "cover" | "content" | "list" | "quote" | "image" | "cta";
export type ContentProviderId = "rules" | "local" | "openai";

export interface StructuredSlide {
  id: string;
  role: SlideRole;
  headline?: string;
  subheadline?: string;
  body?: string;
  cta?: string;
  visualIntent?: string;
  imageQuery?: string;
  keywords?: string[];
}

export interface StructuredPost {
  language: string;
  contentType: ContentType;
  recommendedFormat: "single" | "carousel";
  title?: string;
  originalCopy: string;
  slides: StructuredSlide[];
  imageQueries?: string[];
  templateTags?: string[];
  contentOverflow?: boolean;
  overflowReason?: string;
}

export interface StructureContentRequest {
  brandId: string;
  copy: string;
  requestedFormat: RequestedFormat;
  outputs: ("feed" | "story")[];
  maxSlides: number;
  preserveCopy: boolean;
  provider?: ContentProviderId;
}

export interface StructureContentResult {
  post: StructuredPost;
  provider: ContentProviderId;
  providerUsed: ContentProviderId;
  cached: boolean;
}
