import { structuredPostSchema } from "@/lib/content/content-schema";
import { createGeneration, listGenerations } from "@/lib/generations";
import { z } from "zod";

const createSchema = z.object({
  brandId: z.string().min(1),
  outputs: z.array(z.enum(["feed", "story"])).min(1),
  post: structuredPostSchema,
  providerUsed: z.enum(["rules", "local", "openai"]).optional(),
});

export async function GET() { return Response.json({ generations: await listGenerations() }); }

export async function POST(request: Request) {
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Dados da geração inválidos." }, { status: 400 });
  return Response.json(await createGeneration(parsed.data), { status: 201 });
}
