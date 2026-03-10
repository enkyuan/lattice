import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq } from "drizzle-orm";
import { Pool } from "pg";
import * as dbSchema from "@lattice/db";
import {
  icpProfiles,
  organizations,
  recommendations,
  signalScores,
  signals,
} from "@lattice/db";
import { fetchSignalFeed, fetchSignalDetail, insertSignalAction } from "@modules/signals/signals.repository";
import type { SignalsQuery } from "@modules/signals/signals.types";

const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
const hasDatabase = testDatabaseUrl.length > 0;
const maybeRun = hasDatabase ? test : test.skip;

type TestDb = ReturnType<typeof drizzle<typeof dbSchema>>;

let pool: Pool | null = null;
let db: TestDb | null = null;

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
 * This ensures 100% clean state and is faster than manual cleanup.
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

describe("signals.repository integration", () => {
  maybeRun("fetchSignalFeed applies ranking and returns total count", async () => {
    await transactional(async (tx) => {
      const suffix = `repo_${Date.now()}`;
      const orgId = `org_${suffix}`;
      const icpId = `icp_${suffix}`;
      const signalHigh = `sig_high_${suffix}`;
      const signalLow = `sig_low_${suffix}`;
      const recommendationId = `rec_${suffix}`;

      await tx.insert(organizations).values({ id: orgId, name: "Repo Org", plan: "pro" });
      await tx.insert(icpProfiles).values({
        id: icpId,
        organizationId: orgId,
        name: "Default ICP",
      });
      await tx.insert(signals).values([
        {
          id: signalHigh,
          organizationId: orgId,
          sourceKind: "reddit",
          sourceEventId: `evt_h_${suffix}`,
          authorHandle: "alpha",
          bodyText: "High rank signal",
          canonicalUrl: "https://example.com/high",
          publishedAt: new Date("2026-03-09T10:00:00.000Z"),
          dedupeKey: `dedupe_h_${suffix}`,
        },
        {
          id: signalLow,
          organizationId: orgId,
          sourceKind: "reddit",
          sourceEventId: `evt_l_${suffix}`,
          authorHandle: "beta",
          bodyText: "Low rank signal",
          canonicalUrl: "https://example.com/low",
          publishedAt: new Date("2026-03-09T09:00:00.000Z"),
          dedupeKey: `dedupe_l_${suffix}`,
        },
      ]);
      await tx.insert(signalScores).values([
        {
          id: `score_h_${suffix}`,
          signalId: signalHigh,
          icpProfileId: icpId,
          relevanceScore: 0.9,
          urgencyScore: 0.8,
          painScore: 0.8,
          blastRadiusScore: 0.7,
          intentScore: 0.95,
          finalRankScore: 0.95,
        },
        {
          id: `score_l_${suffix}`,
          signalId: signalLow,
          icpProfileId: icpId,
          relevanceScore: 0.5,
          urgencyScore: 0.4,
          painScore: 0.4,
          blastRadiusScore: 0.4,
          intentScore: 0.45,
          finalRankScore: 0.45,
        },
      ]);
      await tx.insert(recommendations).values({
        id: recommendationId,
        signalId: signalHigh,
        organizationId: orgId,
        recommendationType: "next-step",
        title: "Review signal",
        body: "Follow up",
        confidence: 0.88,
      });

      const query: SignalsQuery = {
        sort: "rank",
        limit: 10,
        offset: 0,
        source: undefined,
        status: undefined,
        search: undefined,
      };

      const result = await fetchSignalFeed(tx, orgId, query);
      expect(result.total).toBeGreaterThanOrEqual(2);
      expect(result.rows[0]?.id).toBe(signalHigh);
    });
  });

  maybeRun("fetchSignalDetail returns null outside org scope", async () => {
    await transactional(async (tx) => {
      const suffix = `detail_${Date.now()}`;
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
        authorHandle: "scope",
        bodyText: "Scoped signal",
        canonicalUrl: "https://example.com/scoped",
        publishedAt: new Date(),
        dedupeKey: `dedupe_${suffix}`,
      });

      const result = await fetchSignalDetail(tx, orgB, signalId);
      expect(result).toBeNull();
    });
  });

  maybeRun("insertSignalAction is org-scoped and atomic", async () => {
    await transactional(async (tx) => {
      const suffix = `action_${Date.now()}`;
      const orgA = `org_a_${suffix}`;
      const orgB = `org_b_${suffix}`;
      const userId = `user_${suffix}`;
      const signalId = `sig_${suffix}`;

      await tx.insert(organizations).values([
        { id: orgA, name: "Org A", plan: "pro" },
        { id: orgB, name: "Org B", plan: "pro" },
      ]);
      await tx.insert(signals).values({
        id: signalId,
        organizationId: orgA,
        sourceKind: "reddit",
        sourceEventId: `evt_${suffix}`,
        authorHandle: "writer",
        bodyText: "Action signal",
        canonicalUrl: "https://example.com/action",
        publishedAt: new Date(),
        dedupeKey: `dedupe_${suffix}`,
      });

      const denied = await insertSignalAction(tx, {
        organizationId: orgB,
        signalId,
        actorUserId: userId,
        actionType: "save",
      });
      expect(denied).toBeNull();

      const allowed = await insertSignalAction(tx, {
        organizationId: orgA,
        signalId,
        actorUserId: userId,
        actionType: "save",
      });
      expect(allowed).not.toBeNull();
    });
  });
});
