import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq } from "drizzle-orm";
import { Pool } from "pg";
import * as dbSchema from "@lattice/db";
import {
  actions,
  organizations,
  signals,
} from "@lattice/db";
import { AppError } from "@lib/errors";
import { getInboxSignal, setInboxSignalState } from "@modules/signals/signals.service";

const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
const hasDatabase = testDatabaseUrl.length > 0;
const maybeRun = hasDatabase ? test : test.skip;

type TestDb = ReturnType<typeof drizzle<typeof dbSchema>>;

let pool: Pool | null = null;
let db: TestDb | null = null;

const logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
};

beforeAll(async () => {
  if (!hasDatabase) {
    return;
  }
  pool = new Pool({ connectionString: testDatabaseUrl });
  db = drizzle(pool, { schema: dbSchema });
});

afterAll(async () => {
  if (!pool) return;
  await pool.end();
});

function mustDb() {
  if (!db) {
    throw new Error("test database not initialized");
  }
  return db;
}

/**
 * Helper to run a test inside a transaction that always rolls back.
 */
async function transactional(fn: (tx: any) => Promise<void>) {
  const database = mustDb();
  try {
    await database.transaction(async (tx) => {
      await fn(tx);
      throw new Error("ROLLBACK");
    });
  } catch (e: any) {
    if (e.message !== "ROLLBACK") throw e;
  }
}

describe("signals.service integration", () => {
  maybeRun("getInboxSignal throws 404 for missing org-scoped signal", async () => {
    await transactional(async (tx) => {
      const suffix = `svc_missing_${Date.now()}`;
      const orgA = `org_a_${suffix}`;
      const orgB = `org_b_${suffix}`;
      const signalId = `sig_${suffix}`;

      await tx.insert(organizations).values([
        { id: orgA, name: "Org A", plan: "pro" },
        { id: orgB, name: "Org B", plan: "pro" },
      ]);
      await tx.insert(signals).values({
        id: signalId,
        organizationId: orgA,
        sourceKind: "x",
        sourceEventId: `evt_${suffix}`,
        authorHandle: "owner",
        bodyText: "Scoped service signal",
        canonicalUrl: "https://example.com/scoped-service",
        publishedAt: new Date(),
        dedupeKey: `dedupe_${suffix}`,
      });

      try {
        await getInboxSignal({
          db: tx,
          organizationId: orgB,
          signalId,
        });
        throw new Error("expected getInboxSignal to throw");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).status).toBe(404);
        expect((error as AppError).code).toBe("SIGNAL_NOT_FOUND");
      }
    });
  });

  maybeRun("setInboxSignalState persists action and returns update payload", async () => {
    await transactional(async (tx) => {
      const suffix = `svc_state_${Date.now()}`;
      const orgId = `org_${suffix}`;
      const signalId = `sig_${suffix}`;
      const userId = `user_${suffix}`;

      await tx.insert(organizations).values({ id: orgId, name: "Org", plan: "pro" });
      await tx.insert(signals).values({
        id: signalId,
        organizationId: orgId,
        sourceKind: "reddit",
        sourceEventId: `evt_${suffix}`,
        authorHandle: "author",
        bodyText: "State transition signal",
        canonicalUrl: "https://example.com/state",
        publishedAt: new Date(),
        dedupeKey: `dedupe_${suffix}`,
      });

      const result = await setInboxSignalState({
        db: tx,
        organizationId: orgId,
        userId,
        signalId,
        state: "saved",
        requestId: `req_${suffix}`,
        logger,
      });

      expect(result.signalId).toBe(signalId);
      expect(result.state).toBe("saved");
      expect(result.actionId).toBeTruthy();

      const persisted = await tx.query.actions.findFirst({
        where: and(eq(actions.id, result.actionId), eq(actions.organizationId, orgId)),
        columns: { id: true, actionType: true },
      });
      expect(persisted?.actionType).toBe("save");
    });
  });
});
