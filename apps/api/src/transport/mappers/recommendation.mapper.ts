import { DEFAULT_RECOMMENDATION } from "@modules/recommendations/recommendations.constants";

export function mapRecommendation(title: string | null) {
  return title ?? DEFAULT_RECOMMENDATION;
}
