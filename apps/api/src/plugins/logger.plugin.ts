import { Elysia } from "elysia";
import { logger } from "@lib/logger";
import { getRequestIdFromHeaders } from "@lib/request-id";
import { elapsedMs } from "@lib/timing";

const startedAtByRequest = new WeakMap<Request, number>();

export const loggerPlugin = new Elysia({
  name: "logger.plugin",
})
  .decorate("logger", logger)
  .onRequest(({ request, logger }) => {
    startedAtByRequest.set(request, Date.now());
    const observedRequestId = getRequestIdFromHeaders(request.headers);
    logger.info("request.started", {
      url: request.url,
      method: request.method,
      requestId: observedRequestId,
    });
  })
  .onAfterResponse(({ request, logger, set }) => {
    const observedRequestId = getRequestIdFromHeaders(request.headers);
    const startedAt = startedAtByRequest.get(request);
    logger.info("request.completed", {
      url: request.url,
      method: request.method,
      status: set.status,
      requestId: observedRequestId,
      durationMs: startedAt ? elapsedMs(startedAt) : undefined,
    });
    startedAtByRequest.delete(request);
  });
