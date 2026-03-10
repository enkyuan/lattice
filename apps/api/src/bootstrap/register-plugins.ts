import type { Elysia } from "elysia";
import { corsPlugin } from "@plugins/cors.plugin";
import { dbPlugin } from "@plugins/db.plugin";
import { loggerPlugin } from "@plugins/logger.plugin";
import { openapiPlugin } from "@plugins/openapi.plugin";
import { rateLimitPlugin } from "@plugins/rate-limit.plugin";
import { requestContextPlugin } from "@plugins/request-context.plugin";

export function registerPlugins(app: Elysia) {
  app.use(requestContextPlugin);
  app.use(loggerPlugin);
  app.use(corsPlugin);
  app.use(dbPlugin);
  app.use(openapiPlugin);
  app.use(rateLimitPlugin);
}
