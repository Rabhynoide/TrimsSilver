import { z } from "zod";

export const pricePointSchema = z.object({
  item_id: z.string(),
  city: z.string(),
  quality: z.number(),
  sell_price_min: z.number(),
  sell_price_min_date: z.string(),
  sell_price_max: z.number(),
  sell_price_max_date: z.string(),
  buy_price_min: z.number(),
  buy_price_min_date: z.string(),
  buy_price_max: z.number(),
  buy_price_max_date: z.string(),
});

export const pricesResponseSchema = z.array(pricePointSchema);

export const historyDataPointSchema = z.object({
  item_count: z.number(),
  avg_price: z.number(),
  timestamp: z.string(),
});

export const historySeriesSchema = z.object({
  location: z.string(),
  item_id: z.string(),
  quality: z.number(),
  data: z.array(historyDataPointSchema),
});

export const historyResponseSchema = z.array(historySeriesSchema);
