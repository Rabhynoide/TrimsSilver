import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateClientToken } from "@/lib/auth/clientTokens";
import { db } from "@/lib/db";
import { clientToken } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const tokens = await db
    .select({
      id: clientToken.id,
      name: clientToken.name,
      createdAt: clientToken.createdAt,
      lastUsedAt: clientToken.lastUsedAt,
      revokedAt: clientToken.revokedAt,
    })
    .from(clientToken)
    .where(eq(clientToken.userId, session.user.id));

  return NextResponse.json({ tokens });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name =
    typeof body?.name === "string" && body.name.trim()
      ? body.name.trim()
      : "Client lourd";

  const { token, hash } = generateClientToken();
  const id = randomUUID();

  await db.insert(clientToken).values({
    id,
    userId: session.user.id,
    name,
    tokenHash: hash,
  });

  return NextResponse.json({ id, name, token });
}
