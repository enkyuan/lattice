import { createHash } from "node:crypto";
import { Queue } from "bullmq";
import { env } from "@server/env";
import { QueueNames, type IngestFetchJob } from "@lattice/ingestion";
import { normalizeWhitespace } from "@modules/normalization/normalization.utils";
import { withRetry } from "./retry";

const redisUrl = new URL(env.REDIS_URL);
const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  tls: redisUrl.protocol === "rediss:" ? {} : undefined,
};

export const ingestQueue = new Queue(QueueNames.INGEST, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
  },
});

export const scoringQueue = new Queue(QueueNames.SCORING, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
  },
});

export async function enqueueIngestFetch(data: Omit<IngestFetchJob, "type">) {
  const trimmedQuery = normalizeWhitespace(data.query);
  const normalizedQuery = trimmedQuery.toLowerCase();
  const queryHash = createHash("sha256").update(normalizedQuery).digest("hex").slice(0, 16);
  const job: IngestFetchJob = { ...data, query: trimmedQuery, type: "ingest.fetch" };
  // Use a predictable jobId for deduplication (one active fetch per kind+query+org)
  const jobId = `fetch:${data.organizationId}:${data.kind}:${queryHash}`;
  return withRetry(() => ingestQueue.add(job.type, job, { jobId }), 3);
}
