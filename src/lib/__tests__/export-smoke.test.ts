import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { exportSlide } from "../export-slides";
import { RulesContentProvider } from "../content/providers/rules-provider";
import { granistoneBrand } from "../../brands/granistone/brand.config";
import { rankTemplates } from "../template-engine";
import { renderGenerationSlide } from "../visual-engine";

describe("export smoke", () => {
  it("exporta Feed e Story nas dimensões exatas", async () => {
    const slide = { id: "smoke", order: 0, notes: "", previousVersions: [], html: "<main style=\"width:100%;height:100%;background:#27342f;color:white;display:grid;place-items:center;font:700 64px Arial\">Smoke test</main>" };
    const [feed, story] = await Promise.all([exportSlide(slide, "4:5"), exportSlide(slide, "9:16")]);
    const [feedMetadata, storyMetadata] = await Promise.all([sharp(feed).metadata(), sharp(story).metadata()]);
    expect(feed.length).toBeGreaterThan(1000); expect(feedMetadata.width).toBe(1080); expect(feedMetadata.height).toBe(1350);
    expect(story.length).toBeGreaterThan(1000); expect(storyMetadata.width).toBe(1080); expect(storyMetadata.height).toBe(1920);
  }, 60_000);

  it("estrutura, renderiza e exporta Feed e Story totalmente offline", async () => {
    const post = await new RulesContentProvider().structureContent({
      brandId: "granistone",
      copy: "Nova coleção\n\nSuperfícies desenvolvidas para projetos que buscam sofisticação, personalidade e permanência.\n\nFale com nossa equipe.",
      requestedFormat: "auto", outputs: ["feed", "story"], maxSlides: 8, preserveCopy: true, provider: "rules",
    });
    const content = post.slides[0];
    const template = rankTemplates({ brandId: "granistone", post, slide: content })[0];
    const generationSlide = { id: content.id, order: 0, content, templateId: template.id, alternatives: [], variant: "dark" as const, logoVariant: "auto" as const, imagePosition: { x: 50, y: 50 } };
    const [feed, story] = await Promise.all([
      exportSlide({ id: "offline-feed", order: 0, notes: "", previousVersions: [], html: renderGenerationSlide({ brand: granistoneBrand, slide: generationSlide, output: "feed" }) }, "4:5"),
      exportSlide({ id: "offline-story", order: 0, notes: "", previousVersions: [], html: renderGenerationSlide({ brand: granistoneBrand, slide: generationSlide, output: "story" }) }, "9:16"),
    ]);
    const [feedMetadata, storyMetadata] = await Promise.all([sharp(feed).metadata(), sharp(story).metadata()]);
    expect([feedMetadata.width, feedMetadata.height]).toEqual([1080, 1350]);
    expect([storyMetadata.width, storyMetadata.height]).toEqual([1080, 1920]);
  }, 60_000);
});
