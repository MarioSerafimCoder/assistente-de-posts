import { deleteGeneration, getGeneration, updateGeneration } from "@/lib/generations";
import type { Generation } from "@/types/generation";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const generation = await getGeneration((await params).id);
  return generation ? Response.json(generation) : Response.json({ error: "Criação não encontrada." }, { status: 404 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json().catch(() => null) as Partial<Pick<Generation, "name" | "outputs" | "slides">> | null;
  if (!body || (body.slides && !Array.isArray(body.slides))) return Response.json({ error: "Alteração inválida." }, { status: 400 });
  const generation = await updateGeneration((await params).id, body);
  return generation ? Response.json(generation) : Response.json({ error: "Criação não encontrada." }, { status: 404 });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return (await deleteGeneration((await params).id)) ? new Response(null, { status: 204 }) : Response.json({ error: "Criação não encontrada." }, { status: 404 });
}
