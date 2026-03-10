import {
  and,
  count,
  desc,
  eq,
  ilike,
  isNull,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { actions, icpProfiles, recommendations, signalScores, signals } from "@lattice/db";
import type { db } from "@lib/drizzle";
import { createActionId } from "@lib/ids";
import {
  INBOX_STATE_TO_ACTION,
  SIGNAL_ACTION_STATUSES,
  SIGNAL_ACTION_TO_STATE,
  SIGNAL_ACTION_TYPES,
} from "./signals.constants";
import {
  SignalDetailRow,
  SignalActionType,
  SignalFeedResult,
  SignalFeedRow,
  SignalStateActionRecord,
  SignalsQuery,
} from "./signals.types";

type DB = typeof db;
function mapActionTypeToState(actionType: string | null | undefined): SignalFeedRow["state"] {
  if (!actionType) {
    return "new";
  }
  return isSignalActionType(actionType) ? SIGNAL_ACTION_TO_STATE[actionType] : "new";
}

function isSignalActionType(value: string): value is SignalActionType {
  return (SIGNAL_ACTION_TYPES as readonly string[]).includes(value);
}

function mapFeedRow(row: {
  id: string;
  sourceKind: string;
  authorHandle: string | null;
  bodyText: string;
  canonicalUrl: string;
  publishedAt: Date;
  intentScore: number | null;
  painScore: number | null;
  relevanceScore: number | null;
  finalRankScore: number | null;
  recommendation: string | null;
  actionType: string | null;
}): SignalFeedRow {
  return {
    id: row.id,
    sourceKind: row.sourceKind as "reddit" | "x",
    authorHandle: row.authorHandle,
    bodyText: row.bodyText,
    canonicalUrl: row.canonicalUrl,
    publishedAt: row.publishedAt.toISOString(),
    intentScore: row.intentScore,
    painScore: row.painScore,
    relevanceScore: row.relevanceScore,
    finalRankScore: row.finalRankScore,
    recommendation: row.recommendation,
    state: mapActionTypeToState(row.actionType),
  };
}

export async function fetchSignalFeed(
  database: DB,
  orgId: string,
  query: SignalsQuery,
) {
  const scoreLatest = database
    .selectDistinctOn([signalScores.signalId], {
      signalId: signalScores.signalId,
      intentScore: signalScores.intentScore,
      painScore: signalScores.painScore,
      relevanceScore: signalScores.relevanceScore,
      finalRankScore: signalScores.finalRankScore,
    })
    .from(signalScores)
    .innerJoin(icpProfiles, eq(icpProfiles.id, signalScores.icpProfileId))
    .where(eq(icpProfiles.organizationId, orgId))
    .orderBy(
      signalScores.signalId,
      desc(sql`coalesce(${signalScores.finalRankScore}, 0)`),
      desc(signalScores.scoredAt),
    )
    .as("score_latest");

  const recommendationLatest = database
    .selectDistinctOn([recommendations.signalId], {
      signalId: recommendations.signalId,
      recommendation: recommendations.title,
    })
    .from(recommendations)
    .where(eq(recommendations.organizationId, orgId))
    .orderBy(recommendations.signalId, desc(recommendations.createdAt))
    .as("recommendation_latest");

  const actionLatestScoped = database
    .selectDistinctOn([actions.signalId], {
      signalId: actions.signalId,
      actionType: actions.actionType,
    })
    .from(actions)
    .where(eq(actions.organizationId, orgId))
    .orderBy(actions.signalId, desc(actions.createdAt))
    .as("action_latest_scoped");

  const filters: SQL[] = [eq(signals.organizationId, orgId)];

  if (query.source) {
    filters.push(eq(signals.sourceKind, query.source));
  }

  if (query.search) {
    const pattern = `%${query.search}%`;
    filters.push(or(ilike(signals.bodyText, pattern), ilike(signals.authorHandle, pattern))!);
  }

  const statusFilter =
    query.status === undefined
      ? undefined
      : query.status === "new"
        ? isNull(actionLatestScoped.actionType)
        : eq(actionLatestScoped.actionType, INBOX_STATE_TO_ACTION[query.status]);
  if (statusFilter) {
    filters.push(statusFilter);
  }

  const result = await database
    .select({
      id: signals.id,
      sourceKind: signals.sourceKind,
      authorHandle: signals.authorHandle,
      bodyText: signals.bodyText,
      canonicalUrl: signals.canonicalUrl,
      publishedAt: signals.publishedAt,
      intentScore: scoreLatest.intentScore,
      painScore: scoreLatest.painScore,
      relevanceScore: scoreLatest.relevanceScore,
      finalRankScore: scoreLatest.finalRankScore,
      recommendation: recommendationLatest.recommendation,
      actionType: actionLatestScoped.actionType,
    })
    .from(signals)
    .leftJoin(scoreLatest, eq(scoreLatest.signalId, signals.id))
    .leftJoin(recommendationLatest, eq(recommendationLatest.signalId, signals.id))
    .leftJoin(actionLatestScoped, eq(actionLatestScoped.signalId, signals.id))
    .where(and(...filters))
    .orderBy(
      ...(query.sort === "recent"
        ? [desc(signals.publishedAt)]
        : [desc(sql`coalesce(${scoreLatest.finalRankScore}, 0)`), desc(signals.publishedAt)]),
    )
    .limit(query.limit)
    .offset(query.offset);

  const [{ total }] = await database
    .select({ total: count() })
    .from(signals)
    .leftJoin(actionLatestScoped, eq(actionLatestScoped.signalId, signals.id))
    .where(and(...filters));

  const mappedRows: SignalFeedRow[] = result.map(mapFeedRow);
  const totalCount = Number(total ?? 0);

  return {
    rows: mappedRows,
    total: totalCount,
  } satisfies SignalFeedResult;
}

export async function fetchSignalDetail(database: DB, orgId: string, signalId: string) {
  const result = await database.query.signals.findFirst({
    where: and(eq(signals.id, signalId), eq(signals.organizationId, orgId)),
    columns: {
      id: true,
      bodyText: true,
      canonicalUrl: true,
      sourceKind: true,
      authorHandle: true,
      publishedAt: true,
    },
  });

  if (!result) return null;

  return {
    id: result.id,
    bodyText: result.bodyText,
    canonicalUrl: result.canonicalUrl,
    sourceKind: result.sourceKind as "reddit" | "x",
    authorHandle: result.authorHandle,
    publishedAt: result.publishedAt.toISOString(),
  };
}

export async function insertSignalAction(
  database: DB,
  input: {
    organizationId: string;
    signalId: string;
    actorUserId: string;
    actionType: SignalActionType;
  },
): Promise<SignalStateActionRecord | null> {
  const actionId = createActionId();
  const created = await database.transaction(async (tx) => {
    const signal = await tx.query.signals.findFirst({
      where: and(eq(signals.id, input.signalId), eq(signals.organizationId, input.organizationId)),
      columns: { id: true },
    });
    if (!signal) {
      return null;
    }

    const inserted = await tx
      .insert(actions)
      .values({
        id: actionId,
        signalId: input.signalId,
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        actionType: input.actionType,
        status: SIGNAL_ACTION_STATUSES[1], // "completed"
        contentJson: {},
      })
      .returning({
        actionId: actions.id,
        createdAt: actions.createdAt,
      });

    return inserted[0] ?? null;
  });

  const row = created;
  if (!row) {
    return null;
  }

  const createdAt =
    row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date(row.createdAt).toISOString();

  return {
    actionId: row.actionId,
    createdAt,
  };
}
