import { afterEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const verifyClientTokenMock = vi.fn();

vi.mock("@/lib/auth/clientTokens", () => ({
  verifyClientToken: (...args: unknown[]) => verifyClientTokenMock(...args),
}));

const { POST } = await import("./route");

afterEach(() => {
  verifyClientTokenMock.mockReset();
});

function buildRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://example.com/api/client/v1/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/client/v1/sync", () => {
  it("returns 401 when the token is missing or invalid", async () => {
    verifyClientTokenMock.mockResolvedValue(null);

    const response = await POST(
      buildRequest({ character: { name: "Foo" }, skills: [] })
    );

    expect(response.status).toBe(401);
  });

  it("returns 400 for a payload that fails validation, once authenticated", async () => {
    verifyClientTokenMock.mockResolvedValue({ userId: "user-1", tokenId: "token-1" });

    const response = await POST(buildRequest({ character: { name: "" }, skills: [] }));

    expect(response.status).toBe(400);
  });
});
