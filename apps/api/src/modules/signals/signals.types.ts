import type {
  INBOX_ACTIONABLE_STATES,
  INBOX_SORTS,
  INBOX_SOURCES,
  INBOX_STATES,
  SIGNAL_ACTION_TYPES,
} from "./signals.constants";

export type InboxState = "new" | "saved" | "dismissed" | "replied" | "converted";
export type InboxActionableState = (typeof INBOX_ACTIONABLE_STATES)[number];
export type InboxSource = (typeof INBOX_SOURCES)[number];
export type InboxSort = (typeof INBOX_SORTS)[number];
export type SignalActionType = (typeof SIGNAL_ACTION_TYPES)[number];

export type SignalsQuery = {
  source?: InboxSource;
  status?: (typeof INBOX_STATES)[number];
  search?: string;
  sort: InboxSort;
  limit: number;
  offset: number;
};

export type SignalFeedRow = {
  id: string;
  sourceKind: "reddit" | "x";
  authorHandle: string | null;
  bodyText: string;
  canonicalUrl: string;
  publishedAt: string;
  intentScore: number | null;
  painScore: number | null;
  relevanceScore: number | null;
  finalRankScore: number | null;
  recommendation: string | null;
  state: InboxState;
};

export type SignalDetailRow = {
  id: string;
  bodyText: string;
  canonicalUrl: string;
  sourceKind: "reddit" | "x";
  authorHandle: string | null;
  publishedAt: string;
};

export type SignalFeedResult = {
  rows: SignalFeedRow[];
  total: number;
};

export type SignalStateActionRecord = {
  actionId: string;
  createdAt: string;
};
