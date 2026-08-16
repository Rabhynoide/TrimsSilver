import Link from "next/link";
import { DEFAULT_REGION, isRegion } from "@/lib/albion-data/regions";
import { getTopTradedResources } from "@/lib/albion-data/topTraded";
import { getItemById } from "@/lib/items/search";
import { ItemIcon } from "@/components/ItemIcon";
import { RegionLinks } from "@/components/RegionLinks";

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(value));
}

export default async function TopTradedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const regionParam = firstValue(resolvedSearchParams.region);
  const region = isRegion(regionParam) ? regionParam : DEFAULT_REGION;

  let entries: Awaited<ReturnType<typeof getTopTradedResources>> = [];
  let fetchError: string | null = null;
  try {
    entries = await getTopTradedResources(region);
  } catch (error) {
    console.error(error);
    fetchError = "Impossible de récupérer ce classement pour le moment.";
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-neutral-100">
          Objets les plus échangés
        </h1>
        <RegionLinks currentRegion={region} basePath="/top-traded" />
      </div>
      <p className="mb-6 text-sm text-neutral-500">
        Classement des ressources brutes (bois, minerai, fibre, peau,
        pierre) par volume échangé sur les 3 derniers jours de données
        disponibles, toutes villes confondues (hors Marché Noir).
      </p>

      {fetchError && <p className="text-sm text-red-400">{fetchError}</p>}

      {!fetchError && (
        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-neutral-900 text-left text-neutral-400">
              <tr>
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Objet</th>
                <th className="px-4 py-2 font-medium text-right">
                  Volume échangé
                </th>
                <th className="px-4 py-2 font-medium text-right">
                  Prix moyen récent
                </th>
                <th className="px-4 py-2 font-medium text-right">
                  Valeur estimée
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {entries.map((entry, index) => {
                const item = getItemById(entry.itemId);
                const name = item?.name ?? entry.itemId;

                return (
                  <tr key={entry.itemId} className="text-neutral-200">
                    <td className="px-4 py-2 text-neutral-500">{index + 1}</td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/items/${entry.itemId}`}
                        className="flex items-center gap-2 hover:text-amber-400"
                      >
                        <ItemIcon itemId={entry.itemId} size={28} alt={name} />
                        <span>
                          {name}
                          {item?.tier && (
                            <span className="ml-2 text-xs text-neutral-500">
                              T{item.tier}
                            </span>
                          )}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {entry.volume > 0 ? formatNumber(entry.volume) : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {entry.latestAvgPrice
                        ? formatNumber(entry.latestAvgPrice)
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {entry.estimatedValue > 0
                        ? formatNumber(entry.estimatedValue)
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
