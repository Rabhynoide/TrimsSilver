import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchHistory, fetchPrices } from "./client";

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function requestedUrl(fetchMock: ReturnType<typeof vi.fn>) {
  return new URL(fetchMock.mock.calls[0][0] as string | URL);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchPrices", () => {
  const samplePrice = {
    item_id: "T4_BAG",
    city: "Caerleon",
    quality: 1,
    sell_price_min: 100,
    sell_price_min_date: "2026-01-01T00:00:00",
    sell_price_max: 200,
    sell_price_max_date: "2026-01-01T00:00:00",
    buy_price_min: 50,
    buy_price_min_date: "2026-01-01T00:00:00",
    buy_price_max: 90,
    buy_price_max_date: "2026-01-01T00:00:00",
  };

  it("builds the URL for the requested region, items, locations and qualities", async () => {
    const fetchMock = mockFetchOnce([samplePrice]);

    const prices = await fetchPrices({
      region: "europe",
      itemIds: ["T4_BAG", "T5_BAG"],
      locations: ["Caerleon", "Bridgewatch"],
      qualities: [1, 2],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = requestedUrl(fetchMock);
    expect(url.origin).toBe("https://europe.albion-online-data.com");
    expect(url.pathname).toBe("/api/v2/stats/prices/T4_BAG,T5_BAG.json");
    expect(url.searchParams.get("locations")).toBe("Caerleon,Bridgewatch");
    expect(url.searchParams.get("qualities")).toBe("1,2");
    expect(prices).toEqual([samplePrice]);
  });

  it("uses the correct host per region", async () => {
    const fetchMock = mockFetchOnce([samplePrice]);
    await fetchPrices({ region: "americas", itemIds: ["T4_BAG"] });
    expect(requestedUrl(fetchMock).origin).toBe(
      "https://west.albion-online-data.com"
    );
  });

  it("throws when the upstream response is not ok", async () => {
    mockFetchOnce({}, false, 502);

    await expect(
      fetchPrices({ region: "europe", itemIds: ["T4_BAG"] })
    ).rejects.toThrow();
  });

  it("throws when the response does not match the expected schema", async () => {
    mockFetchOnce([{ unexpected: "shape" }]);

    await expect(
      fetchPrices({ region: "europe", itemIds: ["T4_BAG"] })
    ).rejects.toThrow();
  });
});

describe("fetchHistory", () => {
  const sampleSeries = {
    location: "Caerleon",
    item_id: "T4_BAG",
    quality: 1,
    data: [{ item_count: 10, avg_price: 1000, timestamp: "2026-01-01T00:00:00" }],
  };

  it("uses the requested region host and time-scale", async () => {
    const fetchMock = mockFetchOnce([sampleSeries]);

    const history = await fetchHistory({
      region: "asia",
      itemId: "T4_BAG",
      locations: ["Caerleon"],
      timeScale: 6,
    });

    const url = requestedUrl(fetchMock);
    expect(url.origin).toBe("https://east.albion-online-data.com");
    expect(url.pathname).toBe("/api/v2/stats/history/T4_BAG.json");
    expect(url.searchParams.get("time-scale")).toBe("6");
    expect(url.searchParams.get("locations")).toBe("Caerleon");
    expect(history).toEqual([sampleSeries]);
  });

  it("defaults to a daily time-scale", async () => {
    const fetchMock = mockFetchOnce([sampleSeries]);
    await fetchHistory({ region: "europe", itemId: "T4_BAG" });
    expect(requestedUrl(fetchMock).searchParams.get("time-scale")).toBe("24");
  });

  it("throws when the response does not match the expected schema", async () => {
    mockFetchOnce([{ unexpected: "shape" }]);

    await expect(
      fetchHistory({ region: "europe", itemId: "T4_BAG" })
    ).rejects.toThrow();
  });
});
