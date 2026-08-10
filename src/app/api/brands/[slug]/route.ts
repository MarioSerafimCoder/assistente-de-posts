import { getBrand } from "@/brands";
import { getTemplatesForBrand } from "@/templates/registry";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return Response.json({ error: "Marca não encontrada." }, { status: 404 });
  return Response.json({ brand, templates: getTemplatesForBrand(brand.id) });
}
