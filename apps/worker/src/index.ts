import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { Redis } from "ioredis";
import { Worker, Queue, type Job } from "bullmq";
import * as schema from "@lattice/db";
import { env } from "./env";
import { 
  RedditJsonAdapter, 
  TwitterV2Adapter, 
  QueueNames, 
  LatticeJobSchema,
  ScoreSignalJobSchema,
  createRawEventId,
  createSignalId,
  StorageService,
  type IngestFetchJob 
} from "@lattice/ingestion";

// Structured logger with better types
const logger = {
  info: (event: string, context?: Record<string, unknown>) => console.log(JSON.stringify({ level: 'info', event, ts: new Date().toISOString(), ...context })),
  warn: (event: string, context?: Record<string, unknown>) => console.log(JSON.stringify({ level: 'warn', event, ts: new Date().toISOString(), ...context })),
  error: (event: string, context?: Record<string, unknown>) => console.error(JSON.stringify({ level: 'error', event, ts: new Date().toISOString(), ...context })),
};

const pool = new Pool({ connectionString: env.DATABASE_URL });
const db = drizzle(pool, { schema });

const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Initialize Storage if configured
const storage = env.S3_ENDPOINT && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
  ? new StorageService({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION!,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      bucket: env.S3_BUCKET!,
      useSsl: env.S3_USE_SSL!,
    })
  : null;

if (storage) {
  logger.info("storage.initialized", { endpoint: env.S3_ENDPOINT, bucket: env.S3_BUCKET });
} else {
  logger.warn("storage.not_configured", { msg: "Raw payloads will only be stored in Postgres" });
}

// Queue for downstream jobs (scoring)
const scoringQueue = new Queue(QueueNames.SCORING, { connection: redisConnection });

const reddit = new RedditJsonAdapter();
const x = new TwitterV2Adapter({ 
  apiKey: env.X_API_KEY, 
  apiSecret: env.X_API_SECRET,
  bearerToken: env.X_BEARER_TOKEN,
  baseUrl: env.X_BASE_URL 
});

async function processIngestFetch(job: Job<IngestFetchJob>) {
  const { kind, query, organizationId } = job.data;
  logger.info("job.processing", { jobId: job.id, type: job.data.type, kind, query, organizationId });
  
  const adapter = kind === "reddit" ? reddit : x;

  try {
    const result = await adapter.fetch(query, { limit: 10 });
    logger.info("job.fetch.completed", { jobId: job.id, count: result.events.length });

    for (const event of result.events) {
      await db.transaction(async (tx) => {
        // 1. Store raw event (audit & idempotency)
        const rawId = createRawEventId(event.sourceKind, event.sourceEventId);
        await tx.insert(schema.rawEvents).values({
          id: rawId,
          sourceKind: event.sourceKind,
          sourceEventId: event.sourceEventId,
          payloadJson: event.payload,
          fetchedAt: event.fetchedAt,
          dedupeKey: `${event.sourceKind}:${event.sourceEventId}`,
        }).onConflictDoNothing();

        // 2. Optional: Archive to S3 (Garage)
        if (storage) {
          const s3Key = `raw/${event.sourceKind}/${event.sourceEventId}.json`;
          await storage.archive(s3Key, event.payload).catch(err => {
            logger.error("storage.archive_failed", { 
              rawId, 
              key: s3Key, 
              error: err instanceof Error ? err.message : String(err) 
            });
            // We don't fail the whole transaction if archival fails, 
            // as it's secondary to Postgres storage for v1.
          });
        }

        // 3. Normalize
        const signal = adapter.normalize(event);

        // 4. Store signal (idempotency)
        const signalId = createSignalId(signal.sourceKind, signal.sourceEventId);
        await tx.insert(schema.signals).values({
          id: signalId,
          organizationId: organizationId,
          sourceKind: signal.sourceKind,
          sourceEventId: signal.sourceEventId,
          authorHandle: signal.authorHandle,
          authorName: signal.authorName,
          bodyText: signal.bodyText,
          canonicalUrl: signal.canonicalUrl,
          publishedAt: signal.publishedAt,
          normalizedJson: signal.normalizedJson,
          dedupeKey: signal.dedupeKey,
        }).onConflictDoNothing();

        // 5. Enqueue downstream scoring job
        // We do this inside transaction for atomicity (signal exists before scoring starts)
        await scoringQueue.add("score.signal", {
          type: "score.signal",
          signalId: signalId,
          organizationId: organizationId,
        }, {
          jobId: `score:${organizationId}:${signalId}`,
        });
      });
    }

    return { processed: result.events.length };
  } catch (error) {
    logger.error("job.failed", { 
      jobId: job.id, 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

const worker = new Worker(
  QueueNames.INGEST,
  async (job: Job<unknown>) => {
    // RUNTIME VALIDATION (Finding 1)
    const result = LatticeJobSchema.safeParse(job.data);
    if (!result.success) {
      const errorContext = { jobId: job.id, errors: result.error.errors };
      logger.error("job.invalid_payload", errorContext);
      throw new Error(`Invalid job payload: ${JSON.stringify(result.error.errors)}`);
    }

    const data = result.data;
    switch (data.type) {
      case "ingest.fetch":
        return processIngestFetch(job as Job<IngestFetchJob>);
      case "score.signal":
        logger.info("job.scoring.skipped", { jobId: job.id, msg: "Scoring logic not yet implemented" });
        return { skipped: true };
      default:
        // This should be unreachable due to safeParse if schema is correct
        logger.error("job.unhandled", { jobId: job.id });
        throw new Error("Unhandled job type");
    }
  },
  { 
    connection: redisConnection,
    concurrency: 5,
  }
);

const scoringWorker = new Worker(
  QueueNames.SCORING,
  async (job: Job<unknown>) => {
    const result = ScoreSignalJobSchema.safeParse(job.data);
    if (!result.success) {
      logger.error("job.scoring.invalid_payload", { jobId: job.id, errors: result.error.errors });
      throw new Error(`Invalid scoring job payload: ${JSON.stringify(result.error.errors)}`);
    }

    const data = result.data;
    logger.info("job.scoring.processed", {
      jobId: job.id,
      signalId: data.signalId,
      organizationId: data.organizationId,
    });

    // TODO: Implement real score computation + signal_scores persistence.
    return { processed: true };
  },
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

worker.on("completed", (job) => {
  logger.info("job.completed", { jobId: job.id });
});

worker.on("failed", (job, err) => {
  logger.error("job.worker_error", { jobId: job?.id, error: err.message });
});

scoringWorker.on("completed", (job) => {
  logger.info("job.scoring.completed", { jobId: job.id });
});

scoringWorker.on("failed", (job, err) => {
  logger.error("job.scoring.worker_error", { jobId: job?.id, error: err.message });
});

logger.info("worker.started", { queues: [QueueNames.INGEST, QueueNames.SCORING] });

process.on("SIGINT", async () => {
  await worker.close();
  await scoringWorker.close();
  await pool.end();
  redisConnection.disconnect();
  process.exit(0);
});
