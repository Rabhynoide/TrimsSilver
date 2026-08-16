import type { Region } from "@/types/albion";
import { getRegionHost } from "./regions";
import { historyResponseSchema, pricesResponseSchema } from "./schemas";

const PRICE_REVALIDATE_SECONDS = 60;
const HISTORY_REVALIDATE_SECONDS = 300;

async function getJson(url: URL, revalidateSeconds: number) {
  const res = await fetch(url, {
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new Error(
      `L'Albion Data Project a répondu avec le statut ${res.status}`
    );
  }

  return res.json();
}

export async function fetchPrices({
  region,
  itemIds,
  locations,
  qualities,
}: {
  region: Region;
  itemIds: string[];
  locations?: string[];
  qualities?: number[];
}) {
  const url = new URL(
    `/api/v2/stats/prices/${itemIds.join(",")}.json`,
    getRegionHost(region)
  );
  if (locations?.length) {
    url.searchParams.set("locations", locations.join(","));
  }
  if (qualities?.length) {
    url.searchParams.set("qualities", qualities.join(","));
  }

  const json = await getJson(url, PRICE_REVALIDATE_SECONDS);
  return pricesResponseSchema.parse(json);
}

export async function fetchHistory({
  region,
  itemId,
  locations,
  qualities,
  timeScale = 24,
  date,
  endDate,
}: {
  region: Region;
  itemId: string;
  locations?: string[];
  qualities?: number[];
  timeScale?: 1 | 6 | 24;
  date?: string;
  endDate?: string;
}) {
  const url = new URL(
    `/api/v2/stats/history/${itemId}.json`,
    getRegionHost(region)
  );
  if (locations?.length) {
    url.searchParams.set("locations", locations.join(","));
  }
  if (qualities?.length) {
    url.searchParams.set("qualities", qualities.join(","));
  }
  url.searchParams.set("time-scale", String(timeScale));
  if (date) url.searchParams.set("date", date);
  if (endDate) url.searchParams.set("end_date", endDate);

  const json = await getJson(url, HISTORY_REVALIDATE_SECONDS);
  return historyResponseSchema.parse(json);
}
