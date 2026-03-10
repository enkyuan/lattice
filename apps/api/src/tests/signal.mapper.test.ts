import { describe, expect, test } from "bun:test";
import { mapSignalFeed, mapSignalStateUpdate } from "@transport/mappers/signal.mapper";

describe("signal.mapper", () => {
  test("mapSignalFeed preserves pagination metadata", () => {
    const response = mapSignalFeed({
      rows: [],
      total: 123,
      limit: 25,
      offset: 50,
    });

    expect(response.total).toBe(123);
    expect(response.limit).toBe(25);
    expect(response.offset).toBe(50);
    expect(response.items).toEqual([]);
  });

  test("mapSignalStateUpdate returns transport shape", () => {
    const response = mapSignalStateUpdate({
      signalId: "signal_1",
      state: "saved",
      actionId: "action_1",
      updatedAt: "2026-03-09T00:00:00.000Z",
    });

    expect(response).toEqual({
      signalId: "signal_1",
      state: "saved",
      actionId: "action_1",
      updatedAt: "2026-03-09T00:00:00.000Z",
    });
  });
});
