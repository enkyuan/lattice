import type { InboxState } from "@modules/signals/signals.types";

export type SignalResponseDto = {
  id: string;
  sourceKind: "reddit" | "x";
  authorHandle: string;
  bodyText: string;
  canonicalUrl: string;
  publishedAt: string;
  intentScore: number;
  painScore: number;
  relevanceScore: number;
  finalRankScore: number;
  recommendation: string;
  state: InboxState;
};

export type SignalDetailResponseDto = {
  signal: {
    id: string;
    sourceKind: "reddit" | "x";
    authorHandle: string;
    bodyText: string;
    canonicalUrl: string;
    publishedAt: string;
  };
};

export type SignalFeedResponseDto = {
  items: SignalResponseDto[];
  total: number;
  limit: number;
  offset: number;
};

export type SignalStateUpdateResponseDto = {
  signalId: string;
  state: "saved" | "dismissed" | "replied" | "converted";
  actionId: string;
  updatedAt: string;
};
