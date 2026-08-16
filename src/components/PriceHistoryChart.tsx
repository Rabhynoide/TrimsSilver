"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CITIES, type HistorySeries, type Region } from "@/types/albion";

const TIME_SCALES = [
  { value: 24 as const, label: "Journalier" },
  { value: 6 as const, label: "6 heures" },
  { value: 1 as const, label: "Horaire" },
];

const CHART_COLORS = [
  "#f59e0b",
  "#38bdf8",
  "#a78bfa",
  "#34d399",
  "#f87171",
  "#fb923c",
  "#e879f9",
  "#94a3b8",
];

const DEFAULT_LOCATIONS = CITIES.filter((city) => city !== "Black Market");

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

type ChartRow = { timestamp: string } & Record<string, number | string>;

function mergeHistorySeries(series: HistorySeries[]): ChartRow[] {
  const byTimestamp = new Map<string, ChartRow>();

  for (const s of series) {
    for (const point of s.data) {
      const existing = byTimestamp.get(point.timestamp) ?? {
        timestamp: point.timestamp,
      };
      existing[s.location] = point.avg_price;
      byTimestamp.set(point.timestamp, existing);
    }
  }

  return [...byTimestamp.values()].sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  );
}

export function PriceHistoryChart({
  itemId,
  region,
  locations = DEFAULT_LOCATIONS,
}: {
  itemId: string;
  region: Region;
  locations?: readonly string[];
}) {
  const [timeScale, setTimeScale] = useState<1 | 6 | 24>(24);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["item-history", itemId, region, locations.join(","), timeScale],
    queryFn: async () => {
      const params = new URLSearchParams({
        item: itemId,
        region,
        locations: locations.join(","),
        timeScale: String(timeScale),
      });
      const res = await fetch(`/api/history?${params.toString()}`);
      if (!res.ok) throw new Error("Historique indisponible");
      const json = (await res.json()) as { history: HistorySeries[] };
      return json.history;
    },
  });

  const series = data ?? [];
  const chartData = mergeHistorySeries(series);
  const citiesWithData = series.map((s) => s.location);

  return (
    <div className="rounded-lg border border-neutral-800 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-neutral-300">
          Historique des prix
        </h3>
        <div className="inline-flex rounded-lg border border-neutral-700 bg-neutral-900 p-1 text-xs">
          {TIME_SCALES.map((scale) => (
            <button
              key={scale.value}
              type="button"
              onClick={() => setTimeScale(scale.value)}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                timeScale === scale.value
                  ? "bg-amber-500 text-neutral-950"
                  : "text-neutral-400 hover:text-neutral-100"
              }`}
            >
              {scale.label}
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <p className="text-sm text-red-400">
          Impossible de charger l&apos;historique pour le moment.
        </p>
      )}

      {!isError && !isFetching && chartData.length === 0 && (
        <p className="text-sm text-neutral-500">
          Pas assez de données de marché pour tracer un historique.
        </p>
      )}

      {chartData.length > 0 && (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                stroke="#737373"
                fontSize={12}
              />
              <YAxis stroke="#737373" fontSize={12} />
              <Tooltip
                labelFormatter={(value) => formatDate(value as string)}
                contentStyle={{
                  background: "#171717",
                  border: "1px solid #404040",
                  borderRadius: 8,
                }}
              />
              <Legend />
              {citiesWithData.map((city, index) => (
                <Line
                  key={city}
                  type="monotone"
                  dataKey={city}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
