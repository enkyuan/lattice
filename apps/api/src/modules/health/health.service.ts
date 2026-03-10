import { HEALTH_STATUS } from "./health.constants";
import { SERVICE_NAME } from "@lib/constants";
import type { HealthPayload } from "./health.types";

export function getHealth(): HealthPayload {
  return {
    status: HEALTH_STATUS,
    service: SERVICE_NAME,
    now: new Date().toISOString(),
  };
}
