"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ItemIcon } from "@/components/ItemIcon";
import { ItemSearchInput } from "@/components/ItemSearchInput";
import { PriceTable } from "@/components/PriceTable";
import { RegionToggle } from "@/components/RegionToggle";
import { useLocalStorageState } from "@/lib/hooks/useLocalStorageState";
import { DEFAULT_REGION } from "@/lib/albion-data/regions";
import { CITIES, type ItemMeta, type PricePoint, type Region } from "@/types/albion";

const ALL_CITIES = CITIES.filter((city) => city !== "Black Market");
const SELECTION_STORAGE_KEY = "albion-market:price-check-items";

export default function PricesPage() {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedItems, setSelectedItems] = useLocalStorageState<ItemMeta[]>(
    SELECTION_STORAGE_KEY,
    []
  );
  const [selectedCities, setSelectedCities] = useState<string[]>([
    ...ALL_CITIES,
  ]);
  const [onlyNormalQuality, setOnlyNormalQuality] = useState(true);

  const itemIds = useMemo(
    () => selectedItems.map((item) => item.id),
    [selectedItems]
  );
  const itemNames = useMemo(
    () => Object.fromEntries(selectedItems.map((item) => [item.id, item.name])),
    [selectedItems]
  );

  const { data, isFetching, isError } = useQuery({
    queryKey: [
      "prices",
      region,
      itemIds.join(","),
      selectedCities.join(","),
      onlyNormalQuality,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        items: itemIds.join(","),
        region,
        locations: selectedCities.join(","),
      });
      if (onlyNormalQuality) params.set("qualities", "1");

      const res = await fetch(`/api/prices?${params.toString()}`);
      if (!res.ok) throw new Error("Prix indisponibles");
      const json = (await res.json()) as { prices: PricePoint[] };
      return json.prices;
    },
    enabled: itemIds.length > 0 && selectedCities.length > 0,
  });

  const prices = data ?? [];

  function addItem(item: ItemMeta) {
    setSelectedItems((current) =>
      current.some((existing) => existing.id === item.id)
        ? current
        : [...current, item]
    );
  }

  function removeItem(itemId: string) {
    setSelectedItems((current) =>
      current.filter((existing) => existing.id !== itemId)
    );
  }

  function toggleCity(city: string) {
    setSelectedCities((current) =>
      current.includes(city)
        ? current.filter((c) => c !== city)
        : [...current, city]
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-neutral-100">
          Vérification des prix
        </h1>
        <RegionToggle value={region} onChange={setRegion} />
      </div>

      <div className="mb-6">
        <ItemSearchInput
          placeholder="Ajouter un objet à comparer..."
          onSelect={addItem}
        />
      </div>

      {selectedItems.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <span
              key={item.id}
              className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 py-1 pl-1 pr-3 text-sm text-neutral-200"
            >
              <ItemIcon itemId={item.id} size={24} alt={item.name} />
              {item.name}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-neutral-500 hover:text-neutral-200"
                aria-label={`Retirer ${item.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex flex-wrap gap-2">
          {ALL_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => toggleCity(city)}
              className={`rounded-full border px-3 py-1 transition-colors ${
                selectedCities.includes(city)
                  ? "border-amber-500 bg-amber-500/10 text-amber-400"
                  : "border-neutral-700 text-neutral-500 hover:text-neutral-200"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-neutral-400">
          <input
            type="checkbox"
            checked={onlyNormalQuality}
            onChange={(event) => setOnlyNormalQuality(event.target.checked)}
            className="accent-amber-500"
          />
          Qualité normale uniquement
        </label>
      </div>

      {selectedItems.length === 0 && (
        <p className="text-sm text-neutral-500">
          Ajoutez un ou plusieurs objets ci-dessus pour voir leurs prix.
        </p>
      )}

      {selectedItems.length > 0 && isError && (
        <p className="text-sm text-red-400">
          Impossible de récupérer les prix pour le moment.
        </p>
      )}

      {selectedItems.length > 0 && !isError && (
        <>
          {isFetching && (
            <p className="mb-2 text-xs text-neutral-500">Actualisation...</p>
          )}
          <PriceTable prices={prices} itemNames={itemNames} />
        </>
      )}
    </div>
  );
}
