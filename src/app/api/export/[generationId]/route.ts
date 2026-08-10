import archiver from "archiver";
import { getBrand } from "@/brands";
import { getGeneration } from "@/lib/generations";
import { renderGenerationSlide } from "@/lib/visual-engine";
import { exportSlide } from "@/lib/export-slides";
import { sanitizeFileName } from "@/lib/filename";
import type { AspectRatio, Slide } from "@/types/carousel";
import type { SocialOutput } from "@/types/template";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

async function zip(files: { name: string; buffer: Buffer }[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 6 } });
    const chunks: Buffer[] = [];
    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);
    files.forEach((file) => archive.append(file.buffer, { name: file.name }));
    void archive.finalize();
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ generationId: string }> }) {
  const generation = await getGeneration((await params).generationId);
  if (!generation) return Response.json({ error: "Criação não encontrada." }, { status: 404 });
  const brand = getBrand(generation.brandId);
  if (!brand) return Response.json({ error: "Marca não encontrada." }, { status: 404 });
  const requested = new URL(request.url).searchParams.get("output") || "all";
  const outputs: SocialOutput[] = requested === "all" ? generation.outputs : requested === "feed" || requested === "story" ? [requested] : [];
  if (!outputs.length) return Response.json({ error: "Formato de exportação inválido." }, { status: 400 });
  try {
    const prefix = `${sanitizeFileName(brand.slug)}-${sanitizeFileName(generation.name)}`;
    const files: { name: string; buffer: Buffer }[] = [];
    for (const output of outputs) {
      const ratio: AspectRatio = output === "feed" ? "4:5" : "9:16";
      for (let index = 0; index < generation.slides.length; index++) {
        const item = generation.slides[index];
        const slide: Slide = { id: item.id, html: renderGenerationSlide({ brand, slide: item, output }), order: index, notes: "", previousVersions: [] };
        files.push({ name: `${outputs.length > 1 ? `${output === "feed" ? "feed" : "stories"}/` : ""}${prefix}-${output}-${String(index + 1).padStart(2, "0")}.png`, buffer: await exportSlide(slide, ratio) });
      }
    }
    if (files.length === 1) return new Response(new Uint8Array(files[0].buffer), { headers: { "Content-Type": "image/png", "Content-Disposition": `attachment; filename="${files[0].name}"` } });
    const buffer = await zip(files);
    return new Response(new Uint8Array(buffer), { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="${prefix}.zip"` } });
  } catch (error) {
    console.error("generation export failed", error instanceof Error ? error.name : "unknown");
    return Response.json({ error: "Falha ao gerar PNG." }, { status: 500 });
  }
}
