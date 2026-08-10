import type { SlideRole } from "@/types/content";
import { isListBlock } from "./list-detector";
import { isQuoteBlock } from "./quote-detector";

export function resolveSlideRole(text: string): SlideRole {
  if (isListBlock(text)) return "list";
  if (isQuoteBlock(text)) return "quote";
  return "content";
}
