import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_REGION, isRegion } from "@/lib/albion-data/regions";
import { getTopTradedResources } from "@/lib/albion-data/topTraded";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");

  try {
    const entries = await getTopTradedResources(
      isRegion(region) ? region : DEFAULT_REGION
    );
    return NextResponse.json({ entries });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          "Impossible de récupérer les objets les plus échangés pour le moment.",
      },
      { status: 502 }
    );
  }
}
