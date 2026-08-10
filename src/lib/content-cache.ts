import { createHash } from "crypto";
import { readDataSafe, writeData } from "./data";
import type { StructureContentRequest, StructuredPost } from "@/types/content";

const FILE = "content-cache.json";
type CacheData = Record<string, { value: StructuredPost; createdAt: string }>;

export function createContentCacheKey(request: StructureContentRequest): string {
  return createHash("sha256").update(JSON.stringify({
    brand: request.brandId,
    copy: request.copy,
    requestedFormat: request.requestedFormat,
    preserveCopy: request.preserveCopy,
    maxSlides: request.maxSlides,
  })).digest("hex");
}

export async function getCachedContent(key: string): Promise<StructuredPost | null> {
  const cache = await readDataSafe<CacheData>(FILE, {});
  return cache[key]?.value ?? null;
}

export async function setCachedContent(key: string, value: StructuredPost): Promise<void> {
  const cache = await readDataSafe<CacheData>(FILE, {});
  cache[key] = { value, createdAt: new Date().toISOString() };
  const entries = Object.entries(cache).sort((a, b) => b[1].createdAt.localeCompare(a[1].createdAt)).slice(0, 100);
  await writeData(FILE, Object.fromEntries(entries));
}
