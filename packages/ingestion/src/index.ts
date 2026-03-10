import { z } from "zod";

/**
 * Reddit specific payload shape
 */
export const RedditPayloadSchema = z.object({
  name: z.string(),
  author: z.string(),
  title: z.string(),
  selftext: z.string().optional(),
  permalink: z.string(),
  created_utc: z.number(),
  subreddit: z.string(),
  ups: z.number().optional(),
  num_comments: z.number().optional(),
  is_video: z.boolean().optional(),
});

/**
 * Twitter specific payload shape
 */
export const TwitterPayloadSchema = z.object({
  id: z.string(),
  text: z.string(),
  created_at: z.string(),
  author_id: z.string().optional(),
  public_metrics: z.record(z.unknown()).optional(),
  entities: z.record(z.unknown()).optional(),
  _author: z.object({
    username: z.string(),
    name: z.string(),
  }).optional(),
});

/**
 * The raw event as it comes from the source (Reddit/X).
 * We store this in raw_events table.
 */
export const IngestedEventSchema = z.discriminatedUnion("sourceKind", [
  z.object({
    sourceKind: z.literal("reddit"),
    sourceEventId: z.string(),
    payload: RedditPayloadSchema,
    fetchedAt: z.date(),
  }),
  z.object({
    sourceKind: z.literal("x"),
    sourceEventId: z.string(),
    payload: TwitterPayloadSchema,
    fetchedAt: z.date(),
  }),
]);

export type IngestedEvent = z.infer<typeof IngestedEventSchema>;

/**
 * The normalized signal, ready for scoring and ranking.
 * Matches the 'signals' table schema.
 */
export const NormalizedSignalSchema = z.object({
  sourceKind: z.enum(["reddit", "x"]),
  sourceEventId: z.string(),
  authorHandle: z.string().nullable(),
  authorName: z.string().nullable(),
  bodyText: z.string(),
  canonicalUrl: z.string(),
  publishedAt: z.date(),
  normalizedJson: z.record(z.unknown()).optional(),
  dedupeKey: z.string(),
});

export type NormalizedSignal = z.infer<typeof NormalizedSignalSchema>;

export interface FetchResult {
  events: IngestedEvent[];
  cursor?: string;
}

/**
 * Generic interface for platform adapters
 */
export interface IngestionAdapter {
  kind: "reddit" | "x";
  fetch(query: string, options?: { cursor?: string; limit?: number }): Promise<FetchResult>;
  normalize(event: IngestedEvent): NormalizedSignal;
}

export * from "./adapters/reddit-json.adapter";
export * from "./adapters/twitter-v2.adapter";
export * from "./storage";
export * from "./ids";
export * from "./queues";
