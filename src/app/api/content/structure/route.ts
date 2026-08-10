import { handleStructureContentRequest } from "@/lib/content/http";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) { return handleStructureContentRequest(request); }
