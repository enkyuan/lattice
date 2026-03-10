import { DEFAULT_RECOMMENDATION } from "./recommendations.constants";
import type { Recommendation } from "./recommendations.types";

export function buildRecommendation(): Recommendation {
  return {
    title: DEFAULT_RECOMMENDATION,
  };
}
