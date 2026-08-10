import type { ContentType } from "@/types/content";
import { normalizeForMatching } from "./text-normalizer";

export const CONTENT_TYPE_SIGNALS: Record<Exclude<ContentType, "editorial" | "other">, string[]> = {
  product: ["produto", "coleção", "modelo", "material", "linha", "acabamento", "superfície", "lançamento"],
  commercial: ["oferta", "promoção", "desconto", "condição", "compre", "preço", "aproveite"],
  commemorative: ["dia dos pais", "dia das mães", "natal", "ano novo", "páscoa", "aniversário", "homenagem", "celebramos"],
  informational: ["como", "passo", "dica", "saiba", "entenda", "por que", "benefício", "vantagem"],
  institutional: [],
};

export function classifyContent(text: string): ContentType {
  const normalized = ` ${normalizeForMatching(text)} `;
  const ordered: ContentType[] = ["commercial", "commemorative", "product", "informational"];
  for (const type of ordered) {
    if (CONTENT_TYPE_SIGNALS[type as keyof typeof CONTENT_TYPE_SIGNALS].some((signal) => normalized.includes(` ${normalizeForMatching(signal)} `))) return type;
  }
  return "institutional";
}
