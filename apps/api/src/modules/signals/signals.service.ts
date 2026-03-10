import type { db } from "@lib/drizzle";
import { AppError } from "@lib/errors";
import type { AppLogger } from "@lib/logger";
import { logSignalQuery } from "./signals.logger";
import {
  fetchSignalDetail,
  fetchSignalFeed,
  insertSignalAction,
} from "./signals.repository";
import type { InboxActionableState, SignalsQuery } from "./signals.types";
import { INBOX_STATE_TO_ACTION } from "./signals.constants";

type DB = typeof db;

export async function getInboxFeed(input: {
  db: DB;
  organizationId: string;
  query: SignalsQuery;
  requestId: string;
  logger: AppLogger;
}) {
  const result = await fetchSignalFeed(input.db, input.organizationId, input.query);
  logSignalQuery({
    logger: input.logger,
    requestId: input.requestId,
    organizationId: input.organizationId,
    source: input.query.source,
    status: input.query.status,
  });

  return {
    items: result.rows,
    total: result.total,
    limit: input.query.limit,
    offset: input.query.offset,
  };
}

export async function getInboxSignal(input: {
  db: DB;
  organizationId: string;
  signalId: string;
}) {
  const signal = await fetchSignalDetail(input.db, input.organizationId, input.signalId);
  if (!signal) {
    throw new AppError("Signal not found", { status: 404, code: "SIGNAL_NOT_FOUND" });
  }
  return signal;
}

function mapStateToActionType(state: InboxActionableState): "save" | "dismiss" | "reply" | "mark-converted" {
  return INBOX_STATE_TO_ACTION[state];
}

export async function setInboxSignalState(input: {
  db: DB;
  organizationId: string;
  userId: string;
  signalId: string;
  state: InboxActionableState;
  requestId: string;
  logger: AppLogger;
}) {
  const action = await insertSignalAction(input.db, {
    organizationId: input.organizationId,
    signalId: input.signalId,
    actorUserId: input.userId,
    actionType: mapStateToActionType(input.state),
  });
  if (!action) {
    throw new AppError("Signal not found", { status: 404, code: "SIGNAL_NOT_FOUND" });
  }

  input.logger.info("action.state.updated", {
    requestId: input.requestId,
    organizationId: input.organizationId,
    signalId: input.signalId,
    state: input.state,
    actionId: action.actionId,
  });

  return {
    signalId: input.signalId,
    state: input.state,
    actionId: action.actionId,
    updatedAt: action.createdAt,
  };
}
