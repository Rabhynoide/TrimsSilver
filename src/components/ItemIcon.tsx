"use client";

import { useState } from "react";

const RENDER_BASE_URL = "https://render.albiononline.com/v1/item";

export function ItemIcon({
  itemId,
  size = 48,
  quality,
  alt,
}: {
  itemId: string;
  size?: number;
  quality?: number;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded bg-neutral-800 text-xs text-neutral-500"
        style={{ width: size, height: size }}
      >
        ?
      </div>
    );
  }

  const src = `${RENDER_BASE_URL}/${itemId}.png?size=${size}${
    quality ? `&quality=${quality}` : ""
  }`;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external per-item render service, not a static asset
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="shrink-0 rounded bg-neutral-800"
      onError={() => setFailed(true)}
    />
  );
}
