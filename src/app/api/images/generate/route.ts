import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { z } from "zod";
import { getBrand } from "@/brands";
import { getOpenAIClient } from "@/lib/openai/client";
import { generateId } from "@/lib/utils";

const requestSchema = z.object({ brandId: z.string(), subject: z.string().min(3).max(500), visualIntent: z.string().max(300).optional() });

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Descreva a imagem desejada." }, { status: 400 });
  const brand = getBrand(parsed.data.brandId);
  if (!brand) return Response.json({ error: "Marca não encontrada." }, { status: 404 });
  try {
    const prompt = `Fotografia vertical sem texto, sem logotipo e sem identidade gráfica aplicada. Assunto: ${parsed.data.subject}. Intenção visual: ${parsed.data.visualIntent ?? "editorial"}. Preferir: ${brand.imageStyle?.preferred.join(", ")}. Evitar: ${brand.imageStyle?.avoid.join(", ")}.`;
    const response = await getOpenAIClient().images.generate({ model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2", prompt, size: "1024x1536", response_format: "b64_json" });
    const base64 = response.data?.[0]?.b64_json;
    if (!base64) throw new Error("NO_IMAGE_DATA");
    const id = generateId();
    const directory = path.resolve(process.cwd(), "public/uploads/generated");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, `${id}.png`), Buffer.from(base64, "base64"));
    return Response.json({ id, url: `/uploads/generated/${id}.png`, source: "openai" });
  } catch (error) {
    if (error instanceof Error && error.message === "OPENAI_NOT_CONFIGURED") return Response.json({ error: "A API OpenAI não está configurada." }, { status: 503 });
    console.error("image generation failed", error instanceof Error ? error.name : "unknown");
    return Response.json({ error: "Não foi possível gerar a imagem." }, { status: 502 });
  }
}
