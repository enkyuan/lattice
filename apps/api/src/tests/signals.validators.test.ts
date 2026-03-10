import { describe, expect, test } from "bun:test";
import { Value } from "@sinclair/typebox/value";
import {
  inboxQuerySchema,
  inboxActionableStateSchema,
} from "@modules/signals/signals.schemas";

describe("signals.schemas", () => {
  test("inboxQuerySchema validates pagination constraints", () => {
    // Valid cases
    expect(Value.Check(inboxQuerySchema, { limit: 10, offset: 100 })).toBe(true);
    expect(Value.Check(inboxQuerySchema, { limit: 1, offset: 0 })).toBe(true);
    expect(Value.Check(inboxQuerySchema, { limit: 100, offset: 10000 })).toBe(true);

    // Invalid cases
    expect(Value.Check(inboxQuerySchema, { limit: 0 })).toBe(false);
    expect(Value.Check(inboxQuerySchema, { limit: 101 })).toBe(false);
    expect(Value.Check(inboxQuerySchema, { offset: -1 })).toBe(false);
    expect(Value.Check(inboxQuerySchema, { offset: 10001 })).toBe(false);
  });

  test("inboxQuerySchema validates enum values", () => {
    expect(
      Value.Check(inboxQuerySchema, {
        source: "reddit",
        status: "new",
        sort: "recent",
        limit: 50,
        offset: 0,
      }),
    ).toBe(true);

    expect(Value.Check(inboxQuerySchema, { source: "hackernews", limit: 50, offset: 0 })).toBe(
      false,
    );
    expect(Value.Check(inboxQuerySchema, { status: "archived", limit: 50, offset: 0 })).toBe(false);
    expect(Value.Check(inboxQuerySchema, { sort: "oldest", limit: 50, offset: 0 })).toBe(false);
  });

  test("inboxActionableStateSchema validates actionable states", () => {
    expect(Value.Check(inboxActionableStateSchema, "saved")).toBe(true);
    expect(Value.Check(inboxActionableStateSchema, "dismissed")).toBe(true);
    expect(Value.Check(inboxActionableStateSchema, "replied")).toBe(true);
    expect(Value.Check(inboxActionableStateSchema, "converted")).toBe(true);

    // Non-actionable state
    expect(Value.Check(inboxActionableStateSchema, "new")).toBe(false);
    // Invalid state
    expect(Value.Check(inboxActionableStateSchema, "deleted")).toBe(false);
  });
});
