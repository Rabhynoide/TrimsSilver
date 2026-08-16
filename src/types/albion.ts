export type Region = "europe" | "americas" | "asia";

export const CITIES = [
  "Caerleon",
  "Bridgewatch",
  "Lymhurst",
  "Martlock",
  "Thetford",
  "Fort Sterling",
  "Brecilien",
  "Black Market",
] as const;

export type City = (typeof CITIES)[number];

export const QUALITIES = [1, 2, 3, 4, 5] as const;
export type Quality = (typeof QUALITIES)[number];

export const QUALITY_LABELS: Record<Quality, string> = {
  1: "Normal",
  2: "Bon",
  3: "Excellent",
  4: "Exceptionnel",
  5: "Chef-d'œuvre",
};

export interface ItemMeta {
  id: string;
  name: string;
  nameFr?: string;
  tier?: number;
  enchant?: number;
}

export interface PricePoint {
  item_id: string;
  city: string;
  quality: number;
  sell_price_min: number;
  sell_price_min_date: string;
  sell_price_max: number;
  sell_price_max_date: string;
  buy_price_min: number;
  buy_price_min_date: string;
  buy_price_max: number;
  buy_price_max_date: string;
}

export interface HistoryDataPoint {
  item_count: number;
  avg_price: number;
  timestamp: string;
}

export interface HistorySeries {
  location: string;
  item_id: string;
  quality: number;
  data: HistoryDataPoint[];
}
