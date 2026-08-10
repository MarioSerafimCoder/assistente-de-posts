const LIST_LINE = /^\s*(?:[-*•]|\d+[.)])\s+\S/;

export function isListLine(line: string): boolean {
  return LIST_LINE.test(line);
}

export function isListBlock(block: string): boolean {
  const lines = block.split("\n").filter(Boolean);
  return lines.filter(isListLine).length >= 2;
}

export function countListItems(text: string): number {
  return text.split("\n").filter(isListLine).length;
}
