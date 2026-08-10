export function isHeadlineCandidate(block: string, maxChars: number): boolean {
  const text = block.trim();
  if (!text || text.includes("\n") || text.length > maxChars) return false;
  if (/^(?:t[ií]tulo|headline|tema)\s*:/i.test(text)) return true;
  if (text === text.toLocaleUpperCase("pt-BR") && /[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(text)) return true;
  return !/[.!?;:]$/.test(text) || text.length <= Math.min(60, maxChars);
}

export function removeHeadlineLabel(text: string): string {
  return text.replace(/^(?:t[ií]tulo|headline|tema)\s*:\s*/i, "").trim();
}
