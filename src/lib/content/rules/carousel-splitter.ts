import type { SlideRole } from "@/types/content";
import { resolveSlideRole } from "./slide-role-resolver";

export interface ContentUnit { text: string; role: SlideRole; overflow: boolean }

function splitSentences(text: string): string[] {
  return text.match(/[^.!?]+(?:[.!?]+[”"']?|$)/g)?.map((item) => item.trim()).filter(Boolean) ?? [text];
}

function splitWords(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const word of words) {
    if (!current) { current = word; continue; }
    if (`${current} ${word}`.length <= maxChars) current += ` ${word}`;
    else { chunks.push(current); current = word; }
  }
  if (current) chunks.push(current);
  return chunks;
}

function splitParagraph(text: string, maxChars: number): ContentUnit[] {
  const role = resolveSlideRole(text);
  if (role === "list" || role === "quote" || text.length <= maxChars) return [{ text, role, overflow: text.length > maxChars }];
  const sentences = splitSentences(text);
  const units: ContentUnit[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (sentence.length > maxChars) {
      if (current) { units.push({ text: current, role, overflow: false }); current = ""; }
      units.push(...splitWords(sentence, maxChars).map((chunk) => ({ text: chunk, role, overflow: chunk.length > maxChars })));
    } else if (!current) current = sentence;
    else if (`${current} ${sentence}`.length <= maxChars) current += ` ${sentence}`;
    else { units.push({ text: current, role, overflow: false }); current = sentence; }
  }
  if (current) units.push({ text: current, role, overflow: false });
  return units;
}

export function splitCarouselContent(blocks: string[], maxChars: number): ContentUnit[] {
  return blocks.flatMap((block) => splitParagraph(block, maxChars));
}

export function regroupUnits(units: ContentUnit[], slots: number, maxChars: number): ContentUnit[] {
  if (units.length <= slots || slots <= 0) return units;
  const groups: ContentUnit[] = [];
  let cursor = 0;
  for (let group = 0; group < slots; group++) {
    const remainingUnits = units.length - cursor;
    const remainingGroups = slots - group;
    const take = Math.ceil(remainingUnits / remainingGroups);
    const selected = units.slice(cursor, cursor + take);
    const text = selected.map((item) => item.text).join("\n\n");
    groups.push({
      text,
      role: selected.some((item) => item.role === "list") ? "list" : selected.some((item) => item.role === "quote") ? "quote" : "content",
      overflow: selected.some((item) => item.overflow) || text.length > maxChars,
    });
    cursor += take;
  }
  return groups;
}
