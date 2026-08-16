import { notFound } from "next/navigation";
import { fetchPrices } from "@/lib/albion-data/client";
import { DEFAULT_REGION, isRegion } from "@/lib/albion-data/regions";
import { getItemById } from "@/lib/items/search";
import { ItemIcon } from "@/components/ItemIcon";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { PriceTable } from "@/components/PriceTable";
import { RegionLinks } from "@/components/RegionLinks";
import { CITIES } from "@/types/albion";

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ItemDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ uniqueName: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { uniqueName } = await params;
  const resolvedSearchParams = await searchParams;

  const item = getItemById(uniqueName);
  if (!item) {
    notFound();
  }

  const regionParam = firstValue(resolvedSearchParams.region);
  const region = isRegion(regionParam) ? regionParam : DEFAULT_REGION;

  let prices: Awaited<ReturnType<typeof fetchPrices>> = [];
  let fetchError: string | null = null;
  try {
    prices = await fetchPrices({
      region,
      itemIds: [item.id],
      locations: [...CITIES],
    });
  } catch (error) {
    console.error(error);
    fetchError = "Impossible de récupérer les prix pour le moment.";
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ItemIcon itemId={item.id} size={64} alt={item.name} />
          <div>
            <h1 className="text-xl font-semibold text-neutral-100">
              {item.name}
            </h1>
            <p className="text-sm text-neutral-500">
              {item.id}
              {item.tier ? ` · Tier ${item.tier}` : ""}
              {item.enchant ? `.${item.enchant}` : ""}
            </p>
          </div>
        </div>
        <RegionLinks currentRegion={region} basePath={`/items/${item.id}`} />
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-neutral-300">
          Prix actuels
        </h2>
        {fetchError ? (
          <p className="text-sm text-red-400">{fetchError}</p>
        ) : (
          <PriceTable prices={prices} />
        )}
      </section>

      <section>
        <PriceHistoryChart itemId={item.id} region={region} />
      </section>
    </div>
  );
}
