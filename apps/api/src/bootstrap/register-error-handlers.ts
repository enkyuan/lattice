import type { Elysia } from "elysia";
import { AppError } from "@lib/errors";
import { logger } from "@lib/logger";
import { shapeErrorResponse } from "@middleware/error-shape.middleware";
import { env } from "@server/env";

export function registerErrorHandlers(app: Elysia) {
  app.onError(({ error, request }) => {
    const requestId = request.headers.get("x-request-id") ?? "unknown";
    const isAppError = error instanceof AppError;
    const context = {
      url: request.url,
      method: request.method,
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: isAppError ? error.code : undefined,
      errorDetails: isAppError ? error.details : undefined,
      stack: env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined,
    };

    logger.error("request.failed", context);

    return shapeErrorResponse(error, requestId);
  });
}
