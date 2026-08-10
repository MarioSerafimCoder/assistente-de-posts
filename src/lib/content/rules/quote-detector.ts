export function isQuoteBlock(block: string): boolean {
  const text = block.trim();
  return /^(?:Cita(?:ção|cao)\s*:\s*)/i.test(text)
    || ((text.startsWith('"') && text.endsWith('"'))
      || (text.startsWith("“") && text.endsWith("”"))
      || (text.startsWith("'") && text.endsWith("'")));
}

export function removeQuoteLabel(block: string): string {
  return block.replace(/^Cita(?:ção|cao)\s*:\s*/i, "").trim();
}
