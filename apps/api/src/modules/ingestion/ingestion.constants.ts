export const INGEST_SOURCES = ["reddit", "x"] as const;
export type IngestSource = (typeof INGEST_SOURCES)[number];
export const INGEST_QUERY_MAX_LENGTH = 512;
