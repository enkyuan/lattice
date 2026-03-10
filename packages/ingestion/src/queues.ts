import { z } from "zod";

export const QueueNames = {
  INGEST: "ingest.queue",
  SCORING: "scoring.queue",
} as const;

export const IngestFetchJobSchema = z.object({
  type: z.literal("ingest.fetch"),
  kind: z.enum(["reddit", "x"]),
  query: z.string(),
  organizationId: z.string(),
});

export type IngestFetchJob = z.infer<typeof IngestFetchJobSchema>;

export const IngestNormalizeJobSchema = z.object({
  type: z.literal("ingest.normalize"),
  rawEventId: z.string(),
  organizationId: z.string(),
});

export type IngestNormalizeJob = z.infer<typeof IngestNormalizeJobSchema>;

export const ScoreSignalJobSchema = z.object({
  type: z.literal("score.signal"),
  signalId: z.string(),
  organizationId: z.string(),
});

export type ScoreSignalJob = z.infer<typeof ScoreSignalJobSchema>;

export const LatticeJobSchema = z.discriminatedUnion("type", [
  IngestFetchJobSchema,
  IngestNormalizeJobSchema,
  ScoreSignalJobSchema,
]);

export type LatticeJob = z.infer<typeof LatticeJobSchema>;
