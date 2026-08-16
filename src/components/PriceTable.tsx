import type { PricePoint } from "@/types/albion";

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function formatDate(value: string) {
  if (!value || value.startsWith("0001")) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function PriceTable({
  prices,
  itemNames,
}: {
  prices: PricePoint[];
  itemNames?: Record<string, string>;
}) {
  if (prices.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Aucune donnée de prix disponible pour cette sélection.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-800">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-neutral-900 text-left text-neutral-400">
          <tr>
            {itemNames && <th className="px-4 py-2 font-medium">Objet</th>}
            <th className="px-4 py-2 font-medium">Ville</th>
            <th className="px-4 py-2 font-medium">Qualité</th>
            <th className="px-4 py-2 font-medium text-right">Vente min</th>
            <th className="px-4 py-2 font-medium text-right">Vente max</th>
            <th className="px-4 py-2 font-medium text-right">Achat min</th>
            <th className="px-4 py-2 font-medium text-right">Achat max</th>
            <th className="px-4 py-2 font-medium">Mis à jour</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {prices.map((price, index) => (
            <tr
              key={`${price.item_id}-${price.city}-${price.quality}-${index}`}
              className="text-neutral-200"
            >
              {itemNames && (
                <td className="px-4 py-2">
                  {itemNames[price.item_id] ?? price.item_id}
                </td>
              )}
              <td className="px-4 py-2">{price.city}</td>
              <td className="px-4 py-2">{price.quality}</td>
              <td className="px-4 py-2 text-right">
                {price.sell_price_min > 0
                  ? formatNumber(price.sell_price_min)
                  : "—"}
              </td>
              <td className="px-4 py-2 text-right">
                {price.sell_price_max > 0
                  ? formatNumber(price.sell_price_max)
                  : "—"}
              </td>
              <td className="px-4 py-2 text-right">
                {price.buy_price_min > 0
                  ? formatNumber(price.buy_price_min)
                  : "—"}
              </td>
              <td className="px-4 py-2 text-right">
                {price.buy_price_max > 0
                  ? formatNumber(price.buy_price_max)
                  : "—"}
              </td>
              <td className="px-4 py-2 text-neutral-500">
                {formatDate(price.sell_price_min_date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
