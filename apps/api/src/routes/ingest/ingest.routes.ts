import { Elysia, t } from "elysia";
import { enqueueIngestFetch } from "@lib/queues";
import { resolveAuthOrg } from "@middleware/auth-org-context";
import {
  INGEST_QUERY_MAX_LENGTH,
  INGEST_SOURCES,
  type IngestSource,
} from "@modules/ingestion/ingestion.constants";
import { logIngestionAccepted } from "@modules/ingestion/ingestion.logger";
import { dbPlugin } from "@plugins/db.plugin";
import { loggerPlugin } from "@plugins/logger.plugin";

export const ingestRoutes = new Elysia({
  name: "ingest.routes",
  prefix: "/api/ingest",
})
  .use(dbPlugin)
  .use(loggerPlugin)
  .derive(async ({ request, db }) => resolveAuthOrg(request.headers, db))
  .post(
    "/:source",
    async ({ body, org, params, logger }) => {
      const source = params.source as IngestSource;
      logIngestionAccepted({ logger, source });

      const job = await enqueueIngestFetch({
        kind: source,
        query: body.query,
        organizationId: org.organizationId,
      });

      return {
        accepted: true,
        source,
        jobId: job.id,
      };
    },
    {
      params: t.Object({
        source: t.Union(INGEST_SOURCES.map((source) => t.Literal(source))),
      }),
      body: t.Object({
        query: t.String({ minLength: 1, maxLength: INGEST_QUERY_MAX_LENGTH }),
      }),
    },
  );
