import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { exportSlide } from "../export-slides";

describe("export smoke", () => {
  it("exporta Feed e Story nas dimensões exatas", async () => {
    const slide = { id: "smoke", order: 0, notes: "", previousVersions: [], html: "<main style=\"width:100%;height:100%;background:#27342f;color:white;display:grid;place-items:center;font:700 64px Arial\">Smoke test</main>" };
    const [feed, story] = await Promise.all([exportSlide(slide, "4:5"), exportSlide(slide, "9:16")]);
    const [feedMetadata, storyMetadata] = await Promise.all([sharp(feed).metadata(), sharp(story).metadata()]);
    expect(feed.length).toBeGreaterThan(1000); expect(feedMetadata.width).toBe(1080); expect(feedMetadata.height).toBe(1350);
    expect(story.length).toBeGreaterThan(1000); expect(storyMetadata.width).toBe(1080); expect(storyMetadata.height).toBe(1920);
  }, 60_000);
});
