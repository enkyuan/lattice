export type IngestionSource = "reddit" | "x";

export type IngestionResult = {
  accepted: true;
  source: IngestionSource;
};
