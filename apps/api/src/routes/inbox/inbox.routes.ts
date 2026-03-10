import { Elysia } from "elysia";
import { resolveAuthOrg } from "@middleware/auth-org-context";
import {
  getInboxFeed,
  getInboxSignal,
  setInboxSignalState,
} from "@modules/signals/signals.service";
import {
  inboxQuerySchema,
  inboxStateBodySchema,
  signalIdParamsSchema,
} from "@modules/signals/signals.schemas";
import {
  mapSignalDetail,
  mapSignalFeed,
  mapSignalStateUpdate,
} from "@transport/mappers/signal.mapper";

import { dbPlugin } from "@plugins/db.plugin";
import { loggerPlugin } from "@plugins/logger.plugin";

export const inboxRoutes = new Elysia({
  name: "inbox.routes",
  prefix: "/api",
})
  .use(dbPlugin)
  .use(loggerPlugin)
  .derive(async ({ request, db }) => resolveAuthOrg(request.headers, db))
  .get(
    "/inbox",
    async ({ query, org, requestId, db, logger }) => {
      const result = await getInboxFeed({
        db,
        organizationId: org.organizationId,
        query: query as any, // Elysia + TypeBox handles coercion/defaults
        requestId,
        logger,
      });

      return mapSignalFeed({
        rows: result.items,
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      });
    },
    {
      query: inboxQuerySchema,
    },
  )
  .get(
    "/inbox/:signalId",
    async ({ params, org, db }) => {
      const signal = await getInboxSignal({
        db,
        organizationId: org.organizationId,
        signalId: params.signalId,
      });

      return mapSignalDetail(signal);
    },
    {
      params: signalIdParamsSchema,
    },
  )
  .post(
    "/inbox/:signalId/state",
    async ({ params, body, org, user, requestId, db, logger }) => {
      const result = await setInboxSignalState({
        db,
        organizationId: org.organizationId,
        userId: user.userId,
        signalId: params.signalId,
        state: body.state,
        requestId,
        logger,
      });

      return mapSignalStateUpdate(result);
    },
    {
      params: signalIdParamsSchema,
      body: inboxStateBodySchema,
    },
  );
