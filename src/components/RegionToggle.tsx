"use client";

import { REGIONS, REGION_LABELS } from "@/lib/albion-data/regions";
import type { Region } from "@/types/albion";

/**
 * Controlled region switcher for fully client-rendered pages (e.g. the price
 * check tool), where the region is kept in local component state.
 */
export function RegionToggle({
  value,
  onChange,
}: {
  value: Region;
  onChange: (region: Region) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-neutral-700 bg-neutral-900 p-1 text-sm">
      {REGIONS.map((region) => (
        <button
          key={region}
          type="button"
          onClick={() => onChange(region)}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            value === region
              ? "bg-amber-500 text-neutral-950"
              : "text-neutral-400 hover:text-neutral-100"
          }`}
        >
          {REGION_LABELS[region]}
        </button>
      ))}
    </div>
  );
}
