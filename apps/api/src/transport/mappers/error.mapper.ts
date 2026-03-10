import type { AppError } from "@lib/errors";
import type { ErrorResponseDto } from "@transport/dto/error-response.dto";

export function mapError(error: AppError, requestId?: string): ErrorResponseDto {
  return {
    error: {
      message: error.message,
      code: error.code,
      requestId,
      details: error.details,
    },
  };
}

export function mapErrorToResponse(error: AppError, requestId?: string) {
  return new Response(JSON.stringify(mapError(error, requestId)), {
    status: error.status,
    headers: { "content-type": "application/json" },
  });
}
