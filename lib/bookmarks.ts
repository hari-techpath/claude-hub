const KEY = "ch-bookmarks";
export function getBookmarks(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function isBookmarked(slug: string): boolean {
  return getBookmarks().includes(slug);
}
export function toggleBookmark(slug: string): boolean {
  const bm = getBookmarks();
  if (bm.includes(slug)) { const n = bm.filter(s => s !== slug); localStorage.setItem(KEY, JSON.stringify(n)); return false; }
  bm.unshift(slug); localStorage.setItem(KEY, JSON.stringify(bm)); return true;
}
