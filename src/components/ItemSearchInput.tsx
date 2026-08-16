"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ItemMeta } from "@/types/albion";
import { ItemIcon } from "./ItemIcon";

export function ItemSearchInput({
  placeholder = "Rechercher un objet (ex. Sac de l'adepte, T4_BAG)",
  autoFocus = false,
  onSelect,
}: {
  placeholder?: string;
  autoFocus?: boolean;
  onSelect?: (item: ItemMeta) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timeout);
  }, [query]);

  const trimmedQuery = debouncedQuery.trim();

  const { data, isFetching } = useQuery({
    queryKey: ["item-search", trimmedQuery],
    queryFn: async () => {
      const res = await fetch(
        `/api/items/search?q=${encodeURIComponent(trimmedQuery)}`
      );
      if (!res.ok) throw new Error("Recherche impossible");
      const json = (await res.json()) as { items: ItemMeta[] };
      return json.items;
    },
    enabled: trimmedQuery.length > 1,
  });

  const results = data ?? [];

  function selectItem(item: ItemMeta) {
    setQuery("");
    setDebouncedQuery("");
    setOpen(false);
    if (onSelect) {
      onSelect(item);
    } else {
      router.push(`/items/${item.id}`);
    }
  }

  return (
    <div className="relative w-full max-w-xl">
      <input
        autoFocus={autoFocus}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500 focus:outline-none"
      />
      {open && trimmedQuery.length > 1 && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl">
          {isFetching && (
            <div className="px-4 py-3 text-sm text-neutral-500">
              Recherche...
            </div>
          )}
          {!isFetching && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-neutral-500">
              Aucun résultat
            </div>
          )}
          <ul className="max-h-80 overflow-y-auto">
            {results.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectItem(item)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800"
                >
                  <ItemIcon itemId={item.id} size={32} alt={item.name} />
                  <span className="flex-1">
                    {item.name}
                    {item.tier && (
                      <span className="ml-2 text-xs text-neutral-500">
                        T{item.tier}
                        {item.enchant ? `.${item.enchant}` : ""}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
