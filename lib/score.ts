import { Resource } from "./types";

export function qualityScore(r: Resource): number {
  return Math.round(
    Math.min(r.stars / 500, 30) +
    Math.min(r.weeklyViews / 1000, 20) +
    (r.verified ? 15 : 0) +
    (r.featured ? 10 : 0) +
    (r.trending ? 10 : 0) +
    (r.hot ? 10 : 0) +
    Math.min(r.description.length / 50, 5)
  );
}
