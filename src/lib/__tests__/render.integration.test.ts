import { describe, expect, it } from "vitest";
import { granistoneBrand } from "../../brands/granistone/brand.config";
import { rankTemplates } from "../template-engine";
import { renderGenerationSlide } from "../visual-engine";
import type { StructuredPost } from "../../types/content";

describe("Structured content → template → render", () => {
  it("renderiza o mesmo conteúdo com composições Feed e Story", () => {
    const post: StructuredPost = { language: "pt-BR", contentType: "editorial", recommendedFormat: "carousel", originalCopy: "Conteúdo seguro", slides: [{ id: "s1", role: "cover", headline: "<script>alert(1)</script>", body: "Conteúdo seguro" }] };
    const template = rankTemplates({ brandId: "granistone", post, slide: post.slides[0] })[0];
    const slide = { id: "s1", order: 0, content: post.slides[0], templateId: template.id, alternatives: [], variant: "dark" as const, logoVariant: "auto" as const, imagePosition: { x: 50, y: 50 } };
    const feed = renderGenerationSlide({ brand: granistoneBrand, slide, output: "feed" });
    const story = renderGenerationSlide({ brand: granistoneBrand, slide, output: "story" });
    expect(feed).toContain("width:1080px;height:1350px");
    expect(story).toContain("width:1080px;height:1920px");
    expect(feed).not.toContain("<script>alert");
    expect(feed).toContain("&lt;script&gt;");
  });
});
