import type { ItemMeta } from "@/types/albion";
import itemsData from "./items-data.json";

const items = itemsData as ItemMeta[];

const itemsById = new Map(items.map((item) => [item.id, item]));

// Matches Unicode combining diacritical marks (U+0300-U+036F), built from
// char codes to avoid embedding literal combining characters in source.
const DIACRITIC_RANGE_START = (0x0300).toString(16).padStart(4, "0");
const DIACRITIC_RANGE_END = (0x036f).toString(16).padStart(4, "0");
const COMBINING_DIACRITICS = new RegExp(
  `[\\u${DIACRITIC_RANGE_START}-\\u${DIACRITIC_RANGE_END}]`,
  "g"
);

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "");
}

export function getItemById(id: string): ItemMeta | undefined {
  return itemsById.get(id);
}

export function searchItems(query: string, limit = 20): ItemMeta[] {
  const q = normalize(query.trim());
  if (!q) return [];

  const starts: ItemMeta[] = [];
  const includes: ItemMeta[] = [];

  for (const item of items) {
    const name = normalize(item.name);
    const nameFr = item.nameFr ? normalize(item.nameFr) : "";
    const id = normalize(item.id);

    if (name.startsWith(q) || nameFr.startsWith(q) || id.startsWith(q)) {
      starts.push(item);
    } else if (name.includes(q) || nameFr.includes(q) || id.includes(q)) {
      includes.push(item);
    }
  }

  return [...starts, ...includes].slice(0, limit);
}
