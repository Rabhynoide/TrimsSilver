import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { clientToken } from "@/lib/db/schema";

const TOKEN_PREFIX = "catk_";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a new personal API token for the desktop client. The raw token is
 * only ever returned here, at creation time - only its hash is persisted.
 */
export function generateClientToken(): { token: string; hash: string } {
  const token = `${TOKEN_PREFIX}${randomBytes(32).toString("base64url")}`;
  return { token, hash: hashToken(token) };
}

export function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;

  const [scheme, value] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !value) return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Authenticates a request from the desktop client. Returns the owning
 * user's id when the bearer token matches a non-revoked client token, and
 * records the token as used. Returns null otherwise.
 */
export async function verifyClientToken(
  request: Request
): Promise<{ userId: string; tokenId: string } | null> {
  const token = extractBearerToken(request);
  if (!token) return null;

  const hash = hashToken(token);

  const [row] = await db
    .select({ id: clientToken.id, userId: clientToken.userId })
    .from(clientToken)
    .where(and(eq(clientToken.tokenHash, hash), isNull(clientToken.revokedAt)))
    .limit(1);

  if (!row) return null;

  await db
    .update(clientToken)
    .set({ lastUsedAt: new Date() })
    .where(eq(clientToken.id, row.id));

  return { userId: row.userId, tokenId: row.id };
}
