import { NextRequest, NextResponse } from "next/server";
import { fetchPrices } from "@/lib/albion-data/client";
import { DEFAULT_REGION, isRegion } from "@/lib/albion-data/regions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const itemsParam = searchParams.get("items");

  if (!itemsParam) {
    return NextResponse.json(
      { error: "Le paramètre 'items' est requis." },
      { status: 400 }
    );
  }

  const region = searchParams.get("region");
  const locationsParam = searchParams.get("locations");
  const qualitiesParam = searchParams.get("qualities");

  try {
    const prices = await fetchPrices({
      region: isRegion(region) ? region : DEFAULT_REGION,
      itemIds: itemsParam.split(","),
      locations: locationsParam ? locationsParam.split(",") : undefined,
      qualities: qualitiesParam
        ? qualitiesParam.split(",").map(Number)
        : undefined,
    });

    return NextResponse.json({ prices });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          "Impossible de récupérer les prix depuis l'Albion Data Project.",
      },
      { status: 502 }
    );
  }
}
