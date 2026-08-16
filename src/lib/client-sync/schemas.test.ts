import { describe, expect, it } from "vitest";
import { syncPayloadSchema } from "./schemas";

describe("syncPayloadSchema", () => {
  it("accepts a valid payload", () => {
    const result = syncPayloadSchema.safeParse({
      character: { name: "Foo" },
      skills: [
        { key: "GATHERING_WOOD", fame: 12_345 },
        { key: "GATHERING_ORE", fame: 0 },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("accepts an empty skills list", () => {
    const result = syncPayloadSchema.safeParse({
      character: { name: "Foo" },
      skills: [],
    });

    expect(result.success).toBe(true);
  });

  it("rejects a missing character name", () => {
    const result = syncPayloadSchema.safeParse({
      character: { name: "" },
      skills: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects a negative fame value", () => {
    const result = syncPayloadSchema.safeParse({
      character: { name: "Foo" },
      skills: [{ key: "GATHERING_WOOD", fame: -1 }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects a non-integer fame value", () => {
    const result = syncPayloadSchema.safeParse({
      character: { name: "Foo" },
      skills: [{ key: "GATHERING_WOOD", fame: 1.5 }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty skill key", () => {
    const result = syncPayloadSchema.safeParse({
      character: { name: "Foo" },
      skills: [{ key: "", fame: 1 }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects more than 200 skills", () => {
    const result = syncPayloadSchema.safeParse({
      character: { name: "Foo" },
      skills: Array.from({ length: 201 }, (_, i) => ({
        key: `SKILL_${i}`,
        fame: 1,
      })),
    });

    expect(result.success).toBe(false);
  });

  it("rejects a missing character object", () => {
    const result = syncPayloadSchema.safeParse({ skills: [] });
    expect(result.success).toBe(false);
  });
});
