import Fuse from "fuse.js";
import { Resource } from "./types";
import { RESOURCES } from "./resources";

const FUSE_KEYS = [
  { name: "name", weight: 0.4 },
  { name: "tagline", weight: 0.3 },
  { name: "description", weight: 0.15 },
  { name: "tags", weight: 0.1 },
  { name: "author", weight: 0.05 },
];

const fuse = new Fuse(RESOURCES, {
  keys: FUSE_KEYS,
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
});

const fuseSuggest = new Fuse(RESOURCES, {
  keys: FUSE_KEYS,
  threshold: 0.6,
  includeScore: true,
  minMatchCharLength: 2,
});

export function localSearch(query: string): Resource[] {
  if (!query.trim()) return [];
  return fuse.search(query).map((r) => r.item);
}

export function suggestSearch(query: string): Resource[] {
  if (!query.trim()) return [];
  return fuseSuggest.search(query).slice(0, 3).map((r) => r.item);
}

export async function aiSearch(query: string): Promise<Resource[]> {
  try {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error("AI search failed");
    const data = await res.json();
    return data.results as Resource[];
  } catch {
    return localSearch(query);
  }
}
