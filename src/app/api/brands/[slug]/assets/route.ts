import { getBrand } from "@/brands";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return Response.json({ error: "Marca não encontrada." }, { status: 404 });
  return Response.json({ logos: brand.logos, assets: brand.assets, images: brand.images });
}
