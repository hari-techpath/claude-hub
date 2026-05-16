// localStorage-based vote store
const KEY = "ch-upvotes";

export function getVotes(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

export function hasVoted(slug: string): boolean {
  return !!getVotes()[slug];
}

export function toggleVote(slug: string): boolean {
  const votes = getVotes();
  if (votes[slug]) { delete votes[slug]; localStorage.setItem(KEY, JSON.stringify(votes)); return false; }
  votes[slug] = 1; localStorage.setItem(KEY, JSON.stringify(votes)); return true;
}
