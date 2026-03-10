import type { Elysia } from "elysia";
import { healthRoutes } from "@routes/health/health.routes";
import { ingestRoutes } from "@routes/ingest/ingest.routes";
import { inboxRoutes } from "@routes/inbox/inbox.routes";

export function registerRoutes(app: Elysia) {
  app.use(healthRoutes);
  app.use(inboxRoutes);
  app.use(ingestRoutes);
}
