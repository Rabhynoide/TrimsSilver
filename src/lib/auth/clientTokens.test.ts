import { describe, expect, it } from "vitest";
import { extractBearerToken, generateClientToken, hashToken } from "./clientTokens";

describe("generateClientToken", () => {
  it("returns a prefixed token and its sha256 hash", () => {
    const { token, hash } = generateClientToken();

    expect(token).toMatch(/^catk_/);
    expect(hash).toBe(hashToken(token));
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("generates a different token on every call", () => {
    const first = generateClientToken();
    const second = generateClientToken();

    expect(first.token).not.toBe(second.token);
    expect(first.hash).not.toBe(second.hash);
  });
});

describe("hashToken", () => {
  it("is deterministic for the same input", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
  });

  it("produces different hashes for different inputs", () => {
    expect(hashToken("abc")).not.toBe(hashToken("abd"));
  });
});

describe("extractBearerToken", () => {
  function requestWithAuthHeader(value: string | null) {
    const headers = new Headers();
    if (value !== null) headers.set("authorization", value);
    return new Request("https://example.com", { headers });
  }

  it("extracts the token from a well-formed Bearer header", () => {
    const request = requestWithAuthHeader("Bearer catk_abc123");
    expect(extractBearerToken(request)).toBe("catk_abc123");
  });

  it("is case-insensitive on the scheme", () => {
    const request = requestWithAuthHeader("bearer catk_abc123");
    expect(extractBearerToken(request)).toBe("catk_abc123");
  });

  it("returns null when there is no authorization header", () => {
    expect(extractBearerToken(requestWithAuthHeader(null))).toBeNull();
  });

  it("returns null for a non-Bearer scheme", () => {
    expect(extractBearerToken(requestWithAuthHeader("Basic abc123"))).toBeNull();
  });

  it("returns null when the token value is missing", () => {
    expect(extractBearerToken(requestWithAuthHeader("Bearer"))).toBeNull();
    expect(extractBearerToken(requestWithAuthHeader("Bearer "))).toBeNull();
  });
});
