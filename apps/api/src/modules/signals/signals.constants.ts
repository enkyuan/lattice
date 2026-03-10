import { INGEST_SOURCES } from "@modules/ingestion/ingestion.constants";

export const INBOX_DEFAULT_LIMIT = 50;
export const INBOX_MAX_LIMIT = 100;
export const INBOX_DEFAULT_OFFSET = 0;
export const INBOX_MAX_OFFSET = 10_000;

export const INBOX_SOURCES = INGEST_SOURCES;
export const INBOX_STATES = ["new", "saved", "dismissed", "replied", "converted"] as const;
export const INBOX_SORTS = ["rank", "recent"] as const;
export const INBOX_ACTIONABLE_STATES = ["saved", "dismissed", "replied", "converted"] as const;
export const SIGNAL_ACTION_TYPES = ["save", "dismiss", "reply", "mark-converted"] as const;
export const SIGNAL_ACTION_STATUSES = ["pending", "completed", "failed"] as const;
export type SignalActionStatus = (typeof SIGNAL_ACTION_STATUSES)[number];

export const SIGNAL_ACTION_TO_STATE = {
  save: "saved",
  dismiss: "dismissed",
  reply: "replied",
  "mark-converted": "converted",
} as const;
export const INBOX_STATE_TO_ACTION = {
  saved: "save",
  dismissed: "dismiss",
  replied: "reply",
  converted: "mark-converted",
} as const;
