import type { SignalDetailRow, SignalFeedRow } from "@modules/signals/signals.types";
import { DEFAULT_RECOMMENDATION } from "@modules/recommendations/recommendations.constants";
import type {
  SignalDetailResponseDto,
  SignalFeedResponseDto,
  SignalResponseDto,
  SignalStateUpdateResponseDto,
} from "@transport/dto/signal-response.dto";

type SignalCoreRow = Pick<
  SignalDetailRow,
  "id" | "sourceKind" | "authorHandle" | "bodyText" | "canonicalUrl" | "publishedAt"
>;

function mapSignalCore(row: SignalCoreRow) {
  return {
    id: row.id,
    sourceKind: row.sourceKind,
    authorHandle: row.authorHandle ?? "unknown",
    bodyText: row.bodyText,
    canonicalUrl: row.canonicalUrl,
    publishedAt: row.publishedAt,
  };
}

export function mapSignal(row: SignalFeedRow): SignalResponseDto {
  return {
    ...mapSignalCore(row),
    intentScore: row.intentScore ?? 0,
    painScore: row.painScore ?? 0,
    relevanceScore: row.relevanceScore ?? 0,
    finalRankScore: row.finalRankScore ?? 0,
    recommendation: row.recommendation ?? DEFAULT_RECOMMENDATION,
    state: row.state,
  };
}

export function mapSignalFeed(input: {
  rows: SignalFeedRow[];
  total: number;
  limit: number;
  offset: number;
}): SignalFeedResponseDto {
  return {
    items: input.rows.map(mapSignal),
    total: input.total,
    limit: input.limit,
    offset: input.offset,
  };
}

export function mapSignalDetail(row: SignalDetailRow): SignalDetailResponseDto {
  return {
    signal: mapSignalCore(row),
  };
}

export function mapSignalStateUpdate(input: {
  signalId: string;
  state: "saved" | "dismissed" | "replied" | "converted";
  actionId: string;
  updatedAt: string;
}): SignalStateUpdateResponseDto {
  return {
    signalId: input.signalId,
    state: input.state,
    actionId: input.actionId,
    updatedAt: input.updatedAt,
  };
}
