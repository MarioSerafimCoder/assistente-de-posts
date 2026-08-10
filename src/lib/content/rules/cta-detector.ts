import { normalizeForMatching } from "./text-normalizer";

export const CTA_PATTERNS = [
  "saiba mais", "fale conosco", "fale com nossa equipe", "entre em contato", "conheça",
  "acesse", "confira", "descubra", "compre agora", "solicite", "agende", "visite", "clique",
];

export function isCtaCandidate(block: string, maxChars = 80): boolean {
  const text = block.trim();
  if (!text || text.includes("\n") || text.length > maxChars) return false;
  const normalized = normalizeForMatching(text).replace(/^cta\s*:\s*/, "").replace(/[.!?;:]+$/, "").trim();
  return CTA_PATTERNS.some((pattern) => normalized === normalizeForMatching(pattern)
    || normalized.startsWith(`${normalizeForMatching(pattern)} `));
}

export function removeCtaLabel(text: string): string {
  return text.replace(/^cta\s*:\s*/i, "").trim();
}
