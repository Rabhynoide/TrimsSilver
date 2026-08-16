import { NextRequest, NextResponse } from "next/server";
import { searchItems } from "@/lib/items/search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(Number(limitParam) || 20, 50) : 20;

  return NextResponse.json({ items: searchItems(q, limit) });
}
