import { normalizeForMatching } from "./text-normalizer";

const STOPWORDS = new Set("a o as os um uma uns umas de da do das dos em no na nos nas por para com sem sob sobre e ou que se ao aos à às é são foi ser ter sua seu suas seus este esta isso isto como mais menos muito toda todo já não".split(" "));

export function extractKeywords(text: string, maximum = 8): string[] {
  const words = normalizeForMatching(text).match(/[a-z0-9çáàâãéêíóôõúü-]{3,}/gi) ?? [];
  const counts = new Map<string, { count: number; first: number }>();
  words.forEach((word, index) => {
    if (STOPWORDS.has(word)) return;
    const current = counts.get(word);
    counts.set(word, { count: (current?.count ?? 0) + 1, first: current?.first ?? index });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count || a[1].first - b[1].first || a[0].localeCompare(b[0]))
    .slice(0, maximum)
    .map(([word]) => word);
}
