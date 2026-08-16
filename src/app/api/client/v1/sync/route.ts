import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { verifyClientToken } from "@/lib/auth/clientTokens";
import { syncPayloadSchema } from "@/lib/client-sync/schemas";
import { db } from "@/lib/db";
import { character, characterSkill } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  const auth = await verifyClientToken(request);
  if (!auth) {
    return NextResponse.json(
      { error: "Jeton invalide, révoqué, ou manquant." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = syncPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload invalide.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { character: characterInput, skills } = parsed.data;

  const [existing] = await db
    .select({ id: character.id, userId: character.userId })
    .from(character)
    .where(eq(character.name, characterInput.name))
    .limit(1);

  if (existing && existing.userId !== auth.userId) {
    return NextResponse.json(
      { error: "Ce personnage est déjà synchronisé avec un autre compte." },
      { status: 409 }
    );
  }

  const characterId = existing?.id ?? randomUUID();

  if (existing) {
    await db
      .update(character)
      .set({ lastSyncedAt: new Date() })
      .where(eq(character.id, characterId));
  } else {
    await db.insert(character).values({
      id: characterId,
      userId: auth.userId,
      name: characterInput.name,
    });
  }

  if (skills.length > 0) {
    await db
      .insert(characterSkill)
      .values(
        skills.map((skill) => ({
          id: randomUUID(),
          characterId,
          skillKey: skill.key,
          level: skill.level,
        }))
      )
      .onConflictDoUpdate({
        target: [characterSkill.characterId, characterSkill.skillKey],
        set: { level: sql`excluded.level`, updatedAt: new Date() },
      });
  }

  return NextResponse.json({ characterId, skillsSynced: skills.length });
}
