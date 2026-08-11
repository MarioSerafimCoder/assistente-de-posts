import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { brand02 } from "../../brands/brand-02/brand.config";
import { exportSlide } from "../export-slides";
import { renderGenerationSlide } from "../visual-engine";

const baselines = {
  feed: path.resolve(process.cwd(), "docs/previews/verti-option-01-feed.png"),
  story: path.resolve(process.cwd(), "docs/previews/verti-option-01-story.png"),
};

async function expectVisualMatch(actual: Buffer, baselinePath: string): Promise<void> {
  const expected = await readFile(baselinePath);
  const [actualMeta, expectedMeta] = await Promise.all([sharp(actual).metadata(), sharp(expected).metadata()]);
  expect([actualMeta.width, actualMeta.height]).toEqual([expectedMeta.width, expectedMeta.height]);

  const [actualPixels, expectedPixels] = await Promise.all([
    sharp(actual).resize(108, 192, { fit: "fill" }).removeAlpha().raw().toBuffer(),
    sharp(expected).resize(108, 192, { fit: "fill" }).removeAlpha().raw().toBuffer(),
  ]);

  let absoluteDifference = 0;
  for (let index = 0; index < actualPixels.length; index++) {
    absoluteDifference += Math.abs(actualPixels[index] - expectedPixels[index]);
  }

  const meanChannelDifference = absoluteDifference / actualPixels.length;
  expect(meanChannelDifference).toBeLessThanOrEqual(1);
}

describe("aparência da Verti · Opção 01", () => {
  it("mantém Feed e Stories visualmente compatíveis com os previews aprovados", async () => {
    const content = {
      id: "verti-visual-01",
      role: "cover" as const,
      headline: "Iluminação em altura\nexige conhecimento técnico.",
      body: "Cada instalação precisa ser planejada para garantir segurança durante a execução e eficiência no resultado.",
      cta: "Saiba mais",
      visualIntent: "Profissional em trabalho técnico em altura",
    };
    const generationSlide = {
      id: content.id,
      order: 0,
      content,
      templateId: "verti-option-01",
      alternatives: [],
      variant: "image" as const,
      logoVariant: "auto" as const,
      imageUrl: brand02.images[0].path,
      imagePosition: { x: 50, y: 50 },
    };
    const feedHtml = renderGenerationSlide({ brand: brand02, slide: generationSlide, output: "feed" });
    const storyHtml = renderGenerationSlide({ brand: brand02, slide: generationSlide, output: "story" });

    expect(feedHtml).toContain("Mont-Heavy.woff2");
    expect(feedHtml).toContain("Mont-ExtraLight.woff2");
    expect(feedHtml).not.toContain("verti-marker");
    expect(feedHtml).not.toContain("↗");
    expect(feedHtml).toMatch(/\.verti-callout\{[^}]*font-weight:400/);
    expect(feedHtml).toMatch(/\.verti-callout\{[^}]*line-height:1\.35/);
    expect(feedHtml).toMatch(/\.verti-callout-text\{[^}]*text-align:right/);
    expect(storyHtml).toMatch(/\.verti-headline\{[^}]*font-size:80px/);

    const [feed, story] = await Promise.all([
      exportSlide({ id: "verti-visual-feed", order: 0, notes: "", previousVersions: [], html: feedHtml }, "4:5"),
      exportSlide({ id: "verti-visual-story", order: 0, notes: "", previousVersions: [], html: storyHtml }, "9:16"),
    ]);

    if (process.env.UPDATE_VISUAL_BASELINES === "1") {
      await Promise.all([writeFile(baselines.feed, feed), writeFile(baselines.story, story)]);
    }

    await Promise.all([
      expectVisualMatch(feed, baselines.feed),
      expectVisualMatch(story, baselines.story),
    ]);
  }, 60_000);
});
