import { getBrand } from "@/brands";
import { structureContent } from "./content-engine";
import { structureContentRequestSchema } from "./content-schema";
import { ContentProviderUnavailableError, ContentStructureError } from "./content-provider";

export async function handleStructureContentRequest(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = structureContentRequestSchema.safeParse(body);
  if (!parsed.success) {
    const invalidCopy = parsed.error.issues.some((issue) => issue.path[0] === "copy");
    return Response.json({
      error: invalidCopy ? "Digite ou cole uma copy antes de gerar." : "Revise a copy e as opções informadas.",
      details: parsed.error.flatten().fieldErrors,
    }, { status: 400 });
  }
  if (!getBrand(parsed.data.brandId)) return Response.json({ error: "Marca não encontrada." }, { status: 404 });
  try {
    return Response.json(await structureContent(parsed.data));
  } catch (error) {
    if (error instanceof ContentProviderUnavailableError) {
      return Response.json({
        error: error.message, code: error.code, provider: error.provider, fallbackAvailable: true,
        fallbackMessage: "Sua arte pode ser criada normalmente usando o motor local de estruturação.",
      }, { status: 503 });
    }
    if (error instanceof ContentStructureError) {
      console.error("content structure failed", { provider: error.provider, cause: error.cause instanceof Error ? error.cause.name : "unknown" });
      return Response.json({
        error: error.message, code: error.code, provider: error.provider,
        fallbackAvailable: error.provider !== "rules",
        fallbackMessage: error.provider !== "rules" ? "A copy foi preservada. Você pode continuar sem IA." : undefined,
      }, { status: 502 });
    }
    console.error("content structure failed", error instanceof Error ? error.name : "unknown");
    return Response.json({ error: "Não foi possível interpretar a copy.", code: "CONTENT_STRUCTURE_FAILED" }, { status: 500 });
  }
}
