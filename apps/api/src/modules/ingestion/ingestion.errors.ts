import { AppError } from "@lib/errors";

export class IngestionError extends AppError {
  constructor(message: string, code = "INGESTION_ERROR") {
    super(message, { status: 400, code });
  }
}
