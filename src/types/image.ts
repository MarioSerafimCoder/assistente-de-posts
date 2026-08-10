export interface ResolvedImage {
  id: string;
  url: string;
  source: "user" | "brand" | "pexels" | "openai";
  title: string;
  tags: string[];
  thumbnailUrl?: string;
}
