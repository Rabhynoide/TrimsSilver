"use client";

import { useLocalStorageState } from "@/lib/hooks/useLocalStorageState";
import type { ItemMeta } from "@/types/albion";

const FAVORITES_KEY = "albion-market:favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorageState<ItemMeta[]>(
    FAVORITES_KEY,
    []
  );

  function isFavorite(itemId: string): boolean {
    return favorites.some((item) => item.id === itemId);
  }

  function toggleFavorite(item: ItemMeta) {
    setFavorites((current) =>
      current.some((existing) => existing.id === item.id)
        ? current.filter((existing) => existing.id !== item.id)
        : [...current, item]
    );
  }

  function removeFavorite(itemId: string) {
    setFavorites((current) => current.filter((item) => item.id !== itemId));
  }

  return { favorites, isFavorite, toggleFavorite, removeFavorite };
}
