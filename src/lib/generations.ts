import { readDataSafe, writeData } from "./data";
import { generateId, now } from "./utils";
import { rankTemplates } from "./template-engine";
import type { ContentProviderId, StructuredPost } from "@/types/content";
import type { Generation, GenerationsData, GenerationSlide } from "@/types/generation";
import type { SocialOutput } from "@/types/template";

const FILE = "generations.json";
async function load(): Promise<GenerationsData> { return readDataSafe(FILE, { generations: [] }); }
async function save(data: GenerationsData): Promise<void> { await writeData(FILE, data); }

export async function listGenerations(): Promise<Generation[]> {
  const data = await load();
  return [...data.generations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getGeneration(id: string): Promise<Generation | null> {
  const data = await load();
  return data.generations.find((generation) => generation.id === id) ?? null;
}

export async function createGeneration(input: { brandId: string; post: StructuredPost; outputs: SocialOutput[]; providerUsed?: ContentProviderId }): Promise<Generation> {
  const data = await load();
  const slides: GenerationSlide[] = input.post.slides.map((content, order) => {
    const ranked = rankTemplates({ brandId: input.brandId, post: input.post, slide: content });
    return {
      id: content.id || generateId(), order, content: { ...content, id: content.id || generateId() },
      templateId: ranked[0]?.id ?? "institutional-01",
      alternatives: ranked.slice(1, 3).map((template) => template.id),
      variant: content.imageQuery ? "image" : order % 2 === 0 ? "dark" : "light",
      logoVariant: "auto", imagePosition: { x: 50, y: 50 },
    };
  });
  const generation: Generation = {
    id: generateId(), name: input.post.title || input.post.slides[0]?.headline || "Nova criação",
    brandId: input.brandId, originalCopy: input.post.originalCopy, outputs: input.outputs,
    structuredPost: input.post, providerUsed: input.providerUsed ?? "rules", slides, createdAt: now(), updatedAt: now(),
  };
  data.generations.push(generation);
  await save(data);
  return generation;
}

export async function updateGeneration(id: string, updates: Partial<Pick<Generation, "name" | "outputs" | "slides">>): Promise<Generation | null> {
  const data = await load();
  const index = data.generations.findIndex((generation) => generation.id === id);
  if (index < 0) return null;
  data.generations[index] = { ...data.generations[index], ...updates, updatedAt: now() };
  data.generations[index].slides = data.generations[index].slides.map((slide, order) => ({ ...slide, order }));
  await save(data);
  return data.generations[index];
}

export async function deleteGeneration(id: string): Promise<boolean> {
  const data = await load();
  const before = data.generations.length;
  data.generations = data.generations.filter((generation) => generation.id !== id);
  if (data.generations.length === before) return false;
  await save(data);
  return true;
}
