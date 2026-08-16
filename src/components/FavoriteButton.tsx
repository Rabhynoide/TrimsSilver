"use client";

import { useFavorites } from "@/lib/favorites/useFavorites";
import type { ItemMeta } from "@/types/albion";

export function FavoriteButton({ item }: { item: ItemMeta }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(item.id);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(item)}
      aria-pressed={active}
      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
        active
          ? "border-amber-500 bg-amber-500/10 text-amber-400"
          : "border-neutral-700 text-neutral-400 hover:text-neutral-100"
      }`}
    >
      {active ? "★ Favori" : "☆ Ajouter aux favoris"}
    </button>
  );
}
