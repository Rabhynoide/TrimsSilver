import { describe, expect, it, vi } from "vitest";

vi.mock("./items-data.json", () => ({
  default: [
    { id: "T4_BAG", name: "Adept's Bag", nameFr: "Sac de l'adepte", tier: 4 },
    {
      id: "T4_BAG@1",
      name: "Adept's Bag",
      nameFr: "Sac de l'adepte",
      tier: 4,
      enchant: 1,
    },
    {
      id: "T4_SWORD",
      name: "Adept's Broadsword",
      nameFr: "Épée large de l'adepte",
      tier: 4,
    },
    { id: "T1_SWORD", name: "Sword", nameFr: "Épée", tier: 1 },
    { id: "T5_MOUNT_HORSE", name: "Riding Horse", nameFr: "Cheval de monte", tier: 5 },
  ],
}));

const { getItemById, searchItems } = await import("./search");

describe("getItemById", () => {
  it("returns the matching item", () => {
    expect(getItemById("T4_BAG")?.name).toBe("Adept's Bag");
  });

  it("returns undefined for an unknown id", () => {
    expect(getItemById("NOT_AN_ITEM")).toBeUndefined();
  });
});

describe("searchItems", () => {
  it("returns an empty array for an empty or blank query", () => {
    expect(searchItems("")).toEqual([]);
    expect(searchItems("   ")).toEqual([]);
  });

  it("matches items whose name starts with the query, case-insensitively", () => {
    const ids = searchItems("ADEPT").map((item) => item.id);
    expect(ids).toEqual(expect.arrayContaining(["T4_BAG", "T4_BAG@1", "T4_SWORD"]));
    expect(ids).not.toContain("T5_MOUNT_HORSE");
  });

  it("matches accented French names ignoring diacritics", () => {
    const ids = searchItems("epee").map((item) => item.id);
    expect(ids).toContain("T4_SWORD");
  });

  it("matches by item id", () => {
    const ids = searchItems("t5_mount").map((item) => item.id);
    expect(ids).toContain("T5_MOUNT_HORSE");
  });

  it("ranks prefix matches before substring-only matches", () => {
    // "Sword" (T1_SWORD) starts with the query; "Adept's Broadsword"
    // (T4_SWORD) only contains it mid-name, so it should rank after.
    const ids = searchItems("sword").map((item) => item.id);
    expect(ids.indexOf("T1_SWORD")).toBeLessThan(ids.indexOf("T4_SWORD"));
  });

  it("respects the limit parameter", () => {
    expect(searchItems("adept", 1)).toHaveLength(1);
  });
});
