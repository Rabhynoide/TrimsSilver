import type { Region } from "@/types/albion";
import { CITIES } from "@/types/albion";
import { fetchHistory } from "./client";

/**
 * Curated set of raw gathering resources (Wood, Ore, Fiber, Hide, Rock across
 * their available tiers). The Albion Data Project API has no "top traded
 * items" endpoint, so this ranks a bounded, well-known set of items by
 * recent trade volume rather than attempting to sample the entire item
 * catalogue (which would mean thousands of API calls). See TrimsSilver#1.
 */
const RESOURCE_TIERS: Record<string, number[]> = {
  WOOD: [1, 2, 3, 4, 5, 6, 7, 8],
  HIDE: [1, 2, 3, 4, 5, 6, 7, 8],
  ROCK: [1, 2, 3, 4, 5, 6, 7, 8],
  ORE: [2, 3, 4, 5, 6, 7, 8],
  FIBER: [2, 3, 4, 5, 6, 7, 8],
};

export const TOP_TRADED_ITEM_IDS: string[] = Object.entries(
  RESOURCE_TIERS
).flatMap(([type, tiers]) => tiers.map((tier) => `T${tier}_${type}`));

const TOP_TRADED_LOCATIONS = CITIES.filter((city) => city !== "Black Market");

/** How many of the most recent daily data points to sum per item/city. */
const RECENT_DAYS = 3;

export interface TopTradedEntry {
  itemId: string;
  volume: number;
  latestAvgPrice: number | null;
  estimatedValue: number;
}

export async function getTopTradedResources(
  region: Region
): Promise<TopTradedEntry[]> {
  const series = await fetchHistory({
    region,
    // The history endpoint accepts a comma-separated list of item ids, same
    // as the prices endpoint - batching avoids one request per item.
    itemId: TOP_TRADED_ITEM_IDS.join(","),
    locations: [...TOP_TRADED_LOCATIONS],
    timeScale: 24,
  });

  const byItem = new Map<
    string,
    { volume: number; lastPrice: number; lastTimestamp: string }
  >();

  for (const itemSeries of series) {
    const entry = byItem.get(itemSeries.item_id) ?? {
      volume: 0,
      lastPrice: 0,
      lastTimestamp: "",
    };

    const recentPoints = itemSeries.data.slice(-RECENT_DAYS);
    for (const point of recentPoints) {
      entry.volume += point.item_count;
      if (point.timestamp > entry.lastTimestamp) {
        entry.lastTimestamp = point.timestamp;
        entry.lastPrice = point.avg_price;
      }
    }

    byItem.set(itemSeries.item_id, entry);
  }

  return TOP_TRADED_ITEM_IDS.map((itemId) => {
    const entry = byItem.get(itemId);
    const volume = entry?.volume ?? 0;
    const latestAvgPrice = entry && entry.lastPrice > 0 ? entry.lastPrice : null;

    return {
      itemId,
      volume,
      latestAvgPrice,
      estimatedValue: latestAvgPrice ? volume * latestAvgPrice : 0,
    };
  }).sort((a, b) => b.volume - a.volume);
}
