import type { Region } from "@/types/albion";

const REGION_HOSTS: Record<Region, string> = {
  europe: "https://europe.albion-online-data.com",
  americas: "https://west.albion-online-data.com",
  asia: "https://east.albion-online-data.com",
};

export const REGION_LABELS: Record<Region, string> = {
  europe: "Europe",
  americas: "Amériques",
  asia: "Asie",
};

export const REGIONS: Region[] = ["europe", "americas", "asia"];

export const DEFAULT_REGION: Region = "europe";

export function isRegion(value: string | null | undefined): value is Region {
  return value === "europe" || value === "americas" || value === "asia";
}

export function getRegionHost(region: Region): string {
  return REGION_HOSTS[region];
}
