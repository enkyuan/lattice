import type { logger } from "@lib/logger";

type Logger = typeof logger;

export function logSignalQuery(input: {
  logger: Logger;
  requestId: string;
  organizationId: string;
  source?: string;
  status?: string;
}) {
  input.logger.info("signals.query.executed", {
    requestId: input.requestId,
    organizationId: input.organizationId,
    source: input.source ?? null,
    status: input.status ?? null,
  });
}
