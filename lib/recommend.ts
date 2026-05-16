import { Resource } from "./types";

function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

export interface ScoredResource {
  resource: Resource;
  score: number;
  sharedTags: string[];
}

export function getRecommendations(resource: Resource, all: Resource[], limit = 5): Resource[] {
  return getScoredRecommendations(resource, all, limit).map(x => x.resource);
}

export function getScoredRecommendations(
  resource: Resource,
  all: Resource[],
  limit = 5
): ScoredResource[] {
  return all
    .filter(r => r.id !== resource.id)
    .map(r => {
      let score = jaccardSimilarity(resource.tags, r.tags);
      if (r.type === resource.type) score += 0.2;
      const ucOverlap = resource.useCases.filter(uc => r.useCases.includes(uc)).length;
      score += ucOverlap * 0.15;
      if (r.complexity === resource.complexity) score += 0.1;
      const sharedTags = resource.tags.filter(t => r.tags.includes(t));
      return { resource: r, score, sharedTags };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
