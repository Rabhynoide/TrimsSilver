import Link from "next/link";
import { REGIONS, REGION_LABELS } from "@/lib/albion-data/regions";
import type { Region } from "@/types/albion";

/**
 * Server-renderable region switcher for pages where the region is read from
 * the URL (e.g. item detail pages). Navigates via plain links, no client JS.
 */
export function RegionLinks({
  currentRegion,
  basePath,
}: {
  currentRegion: Region;
  basePath: string;
}) {
  return (
    <div className="inline-flex rounded-lg border border-neutral-700 bg-neutral-900 p-1 text-sm">
      {REGIONS.map((region) => (
        <Link
          key={region}
          href={`${basePath}?region=${region}`}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            currentRegion === region
              ? "bg-amber-500 text-neutral-950"
              : "text-neutral-400 hover:text-neutral-100"
          }`}
        >
          {REGION_LABELS[region]}
        </Link>
      ))}
    </div>
  );
}
