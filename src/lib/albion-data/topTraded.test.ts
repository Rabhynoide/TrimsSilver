import { afterEach, describe, expect, it, vi } from "vitest";

const fetchHistoryMock = vi.fn();

vi.mock("./client", () => ({
  fetchHistory: (...args: unknown[]) => fetchHistoryMock(...args),
}));

const { TOP_TRADED_ITEM_IDS, getTopTradedResources } = await import(
  "./topTraded"
);

afterEach(() => {
  fetchHistoryMock.mockReset();
});

describe("TOP_TRADED_ITEM_IDS", () => {
  it("includes tier-1 resources that exist in-game (wood, hide, rock) but not ore/fiber", () => {
    expect(TOP_TRADED_ITEM_IDS).toContain("T1_WOOD");
    expect(TOP_TRADED_ITEM_IDS).toContain("T1_HIDE");
    expect(TOP_TRADED_ITEM_IDS).toContain("T1_ROCK");
    expect(TOP_TRADED_ITEM_IDS).not.toContain("T1_ORE");
    expect(TOP_TRADED_ITEM_IDS).not.toContain("T1_FIBER");
  });

  it("covers tiers 2 through 8 for every resource type", () => {
    for (const type of ["WOOD", "ORE", "FIBER", "HIDE", "ROCK"]) {
      for (let tier = 2; tier <= 8; tier += 1) {
        expect(TOP_TRADED_ITEM_IDS).toContain(`T${tier}_${type}`);
      }
    }
  });
});

describe("getTopTradedResources", () => {
  it("ranks items by summed volume across cities, descending", async () => {
    fetchHistoryMock.mockResolvedValue([
      {
        location: "Caerleon",
        item_id: "T4_WOOD",
        quality: 1,
        data: [{ item_count: 10, avg_price: 100, timestamp: "2026-08-10T00:00:00" }],
      },
      {
        location: "Bridgewatch",
        item_id: "T4_WOOD",
        quality: 1,
        data: [{ item_count: 5, avg_price: 105, timestamp: "2026-08-11T00:00:00" }],
      },
      {
        location: "Caerleon",
        item_id: "T4_ORE",
        quality: 1,
        data: [{ item_count: 50, avg_price: 50, timestamp: "2026-08-10T00:00:00" }],
      },
    ]);

    const results = await getTopTradedResources("europe");

    const wood = results.find((r) => r.itemId === "T4_WOOD");
    const ore = results.find((r) => r.itemId === "T4_ORE");
    expect(wood?.volume).toBe(15);
    expect(ore?.volume).toBe(50);

    const oreRank = results.findIndex((r) => r.itemId === "T4_ORE");
    const woodRank = results.findIndex((r) => r.itemId === "T4_WOOD");
    expect(oreRank).toBeLessThan(woodRank);
  });

  it("uses the most recent data point's price for the value estimate", async () => {
    fetchHistoryMock.mockResolvedValue([
      {
        location: "Caerleon",
        item_id: "T4_WOOD",
        quality: 1,
        data: [
          { item_count: 10, avg_price: 100, timestamp: "2026-08-09T00:00:00" },
          { item_count: 20, avg_price: 120, timestamp: "2026-08-10T00:00:00" },
        ],
      },
    ]);

    const results = await getTopTradedResources("europe");
    const wood = results.find((r) => r.itemId === "T4_WOOD");

    expect(wood?.latestAvgPrice).toBe(120);
    expect(wood?.volume).toBe(30);
    expect(wood?.estimatedValue).toBe(30 * 120);
  });

  it("only sums the last 3 available data points per series", async () => {
    fetchHistoryMock.mockResolvedValue([
      {
        location: "Caerleon",
        item_id: "T4_WOOD",
        quality: 1,
        data: [
          { item_count: 1000, avg_price: 100, timestamp: "2026-08-01T00:00:00" },
          { item_count: 1, avg_price: 100, timestamp: "2026-08-02T00:00:00" },
          { item_count: 1, avg_price: 100, timestamp: "2026-08-03T00:00:00" },
          { item_count: 1, avg_price: 100, timestamp: "2026-08-04T00:00:00" },
        ],
      },
    ]);

    const results = await getTopTradedResources("europe");
    const wood = results.find((r) => r.itemId === "T4_WOOD");

    // The first (oldest) point with item_count 1000 must be excluded.
    expect(wood?.volume).toBe(3);
  });

  it("returns a zero-volume entry with no estimated value for items with no data", async () => {
    fetchHistoryMock.mockResolvedValue([]);

    const results = await getTopTradedResources("europe");

    expect(results).toHaveLength(TOP_TRADED_ITEM_IDS.length);
    for (const entry of results) {
      expect(entry.volume).toBe(0);
      expect(entry.latestAvgPrice).toBeNull();
      expect(entry.estimatedValue).toBe(0);
    }
  });

  it("passes the requested region and batches all item ids into one call", async () => {
    fetchHistoryMock.mockResolvedValue([]);

    await getTopTradedResources("asia");

    expect(fetchHistoryMock).toHaveBeenCalledTimes(1);
    const call = fetchHistoryMock.mock.calls[0][0];
    expect(call.region).toBe("asia");
    expect(call.itemId.split(",")).toEqual(TOP_TRADED_ITEM_IDS);
  });
});
