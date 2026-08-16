import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientToken } from "@/lib/db/schema";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { id } = await params;

  await db
    .update(clientToken)
    .set({ revokedAt: new Date() })
    .where(and(eq(clientToken.id, id), eq(clientToken.userId, session.user.id)));

  return NextResponse.json({ ok: true });
}
