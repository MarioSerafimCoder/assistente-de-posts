import { isCtaCandidate, removeCtaLabel } from "./cta-detector";
import { isHeadlineCandidate, removeHeadlineLabel } from "./headline-detector";
import { normalizeText } from "./text-normalizer";

type ExplicitField = "headline" | "subheadline" | "body" | "cta";
export interface ParsedCopy {
  normalized: string;
  headline?: string;
  subheadline?: string;
  cta?: string;
  blocks: string[];
}

const FIELD = /^(t[ií]tulo|headline|tema|subt[ií]tulo|subheadline|texto|body|cta)\s*:\s*(.*)$/i;

function fieldName(label: string): ExplicitField {
  const normalized = label.toLocaleLowerCase("pt-BR");
  if (/sub/.test(normalized)) return "subheadline";
  if (/texto|body/.test(normalized)) return "body";
  if (/cta/.test(normalized)) return "cta";
  return "headline";
}

export function parseCopy(input: string, headlineMaxChars: number, ctaMaxChars: number): ParsedCopy {
  const normalized = normalizeText(input);
  const explicit: Partial<Record<ExplicitField, string[]>> = {};
  const bodyLines: string[] = [];
  let active: ExplicitField | null = null;

  for (const line of normalized.split("\n")) {
    if (!line) {
      active = null;
      if (bodyLines.at(-1) !== "") bodyLines.push("");
      continue;
    }
    const match = line.match(FIELD);
    if (match) {
      active = fieldName(match[1]);
      explicit[active] ??= [];
      if (match[2]) {
        if (active === "body") bodyLines.push(match[2]);
        else explicit[active]!.push(match[2]);
      }
      continue;
    }
    if (active === "body" || !active) bodyLines.push(line);
    else explicit[active]!.push(line);
  }

  let blocks = bodyLines.join("\n").split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
  let headline = explicit.headline?.join(" ").trim() || undefined;
  const subheadline = explicit.subheadline?.join(" ").trim() || undefined;
  let cta = explicit.cta?.join(" ").trim() || undefined;

  if (!headline && blocks.length > 1 && isHeadlineCandidate(blocks[0], headlineMaxChars)) {
    headline = removeHeadlineLabel(blocks.shift()!);
  }
  if (!cta && blocks.length > 0 && (blocks.length > 1 || Boolean(headline)) && isCtaCandidate(blocks.at(-1)!, ctaMaxChars)) {
    cta = removeCtaLabel(blocks.pop()!);
  }
  if (!blocks.length && !headline) blocks = [normalized];
  return { normalized, headline, subheadline, cta, blocks };
}
