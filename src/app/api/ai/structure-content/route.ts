import OpenAI from "openai";
import { getBrand } from "@/brands";
import { structureContentRequestSchema } from "@/lib/openai/content-schema";
import { structureContent } from "@/lib/openai/structure-content";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Requisição inválida." }, { status: 400 }); }
  const parsed = structureContentRequestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Revise a copy e as opções informadas.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  if (!getBrand(parsed.data.brandId)) return Response.json({ error: "Marca não encontrada." }, { status: 404 });
  try {
    const result = await structureContent(parsed.data);
    return Response.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "OPENAI_NOT_CONFIGURED") return Response.json({ error: "A API OpenAI não está configurada." }, { status: 503 });
    if (error instanceof OpenAI.AuthenticationError) return Response.json({ error: "A credencial da OpenAI não foi aceita." }, { status: 401 });
    if (error instanceof OpenAI.RateLimitError) return Response.json({ error: "Limite temporário da OpenAI atingido. Tente novamente em instantes." }, { status: 429 });
    if (error instanceof OpenAI.APIConnectionTimeoutError) return Response.json({ error: "A OpenAI demorou demais para responder. Tente novamente." }, { status: 504 });
    console.error("structure-content failed", error instanceof Error ? error.name : "unknown");
    return Response.json({ error: "Não foi possível interpretar a copy." }, { status: 502 });
  }
}
