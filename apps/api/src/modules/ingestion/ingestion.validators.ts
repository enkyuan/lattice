import { IngestionError } from "./ingestion.errors";
import type { IngestionSource } from "./ingestion.types";

export function assertIngestionSource(value: string): IngestionSource {
  if (value === "reddit" || value === "x") {
    return value;
  }
  throw new IngestionError("Unsupported source", "UNSUPPORTED_SOURCE");
}
