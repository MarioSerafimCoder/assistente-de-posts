import { getBrand } from "@/brands";
import type { ResolvedImage } from "@/types/image";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const brand = getBrand(url.searchParams.get("brandId") || "granistone");
  const query = (url.searchParams.get("q") || "").trim().toLowerCase();
  if (!brand) return Response.json({ error: "Marca não encontrada." }, { status: 404 });
  const local: ResolvedImage[] = brand.images.filter((image) => !query || image.tags.some((tag) => tag.toLowerCase().includes(query))).map((image) => ({ id: image.id, url: image.path, source: "brand", title: image.name, tags: image.tags }));
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey || !query) return Response.json({ images: local, pexelsConfigured: Boolean(apiKey) });
  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=12&orientation=portrait`, { headers: { Authorization: apiKey }, cache: "no-store" });
    if (!response.ok) throw new Error("PEXELS_FAILED");
    const data = await response.json() as { photos?: { id: number; alt: string; src: { large2x: string; medium: string } }[] };
    const pexels: ResolvedImage[] = (data.photos ?? []).map((photo) => ({ id: `pexels-${photo.id}`, url: photo.src.large2x, thumbnailUrl: photo.src.medium, source: "pexels", title: photo.alt || query, tags: [query] }));
    return Response.json({ images: [...local, ...pexels], pexelsConfigured: true });
  } catch {
    return Response.json({ images: local, pexelsConfigured: true, warning: "A busca externa está temporariamente indisponível." });
  }
}
