import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_NOT_CONFIGURED");
  if (!client) client = new OpenAI({ apiKey, timeout: 45_000, maxRetries: 1 });
  return client;
}
