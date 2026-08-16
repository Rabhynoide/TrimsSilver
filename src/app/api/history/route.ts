import { NextRequest, NextResponse } from "next/server";
import { fetchHistory } from "@/lib/albion-data/client";
import { DEFAULT_REGION, isRegion } from "@/lib/albion-data/regions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("item");

  if (!itemId) {
    return NextResponse.json(
      { error: "Le paramètre 'item' est requis." },
      { status: 400 }
    );
  }

  const region = searchParams.get("region");
  const locationsParam = searchParams.get("locations");
  const qualitiesParam = searchParams.get("qualities");
  const timeScaleParam = Number(searchParams.get("timeScale") ?? 24);
  const timeScale =
    timeScaleParam === 1 || timeScaleParam === 6 ? timeScaleParam : 24;

  try {
    const history = await fetchHistory({
      region: isRegion(region) ? region : DEFAULT_REGION,
      itemId,
      locations: locationsParam ? locationsParam.split(",") : undefined,
      qualities: qualitiesParam
        ? qualitiesParam.split(",").map(Number)
        : undefined,
      timeScale,
      date: searchParams.get("date") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          "Impossible de récupérer l'historique depuis l'Albion Data Project.",
      },
      { status: 502 }
    );
  }
}
