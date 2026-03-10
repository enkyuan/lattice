import type { AppLogger } from "@lib/logger";

export function logIngestionAccepted(input: {
  logger: Pick<AppLogger, "info">;
  source: "reddit" | "x";
}) {
  input.logger.info("ingest.request.accepted", { source: input.source });
}
