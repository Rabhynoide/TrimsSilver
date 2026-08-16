"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/favorites/useFavorites";
import { ItemIcon } from "./ItemIcon";

export function FavoritesList() {
  const { favorites, removeFavorite } = useFavorites();

  if (favorites.length === 0) {
    return (
      <p className="text-sm text-neutral-600">
        Aucun favori pour l&apos;instant. Ouvrez un objet et cliquez sur «
        Ajouter aux favoris » pour le retrouver ici.
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {favorites.map((item) => (
        <li key={item.id}>
          <span className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 py-1 pl-1 pr-2 text-sm text-neutral-200">
            <Link
              href={`/items/${item.id}`}
              className="flex items-center gap-2 hover:text-amber-400"
            >
              <ItemIcon itemId={item.id} size={24} alt={item.name} />
              {item.name}
            </Link>
            <button
              type="button"
              onClick={() => removeFavorite(item.id)}
              className="text-neutral-500 hover:text-neutral-200"
              aria-label={`Retirer ${item.name} des favoris`}
            >
              ×
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}
