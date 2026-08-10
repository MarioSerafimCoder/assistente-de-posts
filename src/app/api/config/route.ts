export async function GET() {
  return Response.json({
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    pexelsConfigured: Boolean(process.env.PEXELS_API_KEY),
    model: process.env.OPENAI_MODEL || "gpt-5.6-terra",
    imageModel: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
  });
}
