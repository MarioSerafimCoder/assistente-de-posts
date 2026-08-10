import { getLocalAIStatus } from "@/lib/content/providers/local-ai-provider";

export const dynamic = "force-dynamic";

export async function GET() {
  const localAI = await getLocalAIStatus();
  return Response.json({
    defaultProvider: "rules",
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    pexelsConfigured: Boolean(process.env.PEXELS_API_KEY),
    model: process.env.OPENAI_MODEL || "gpt-5.6-terra",
    imageModel: process.env.OPENAI_IMAGE_MODEL || "",
    imageAiConfigured: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_IMAGE_MODEL),
    localAI,
  });
}
