import { brands } from "@/brands";

export async function GET() {
  return Response.json({ brands });
}
