"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import ResourceCard from "@/components/resource-card";
import { resources } from "@/lib/resources";
import { getBookmarks } from "@/lib/bookmarks";

export default function SavedPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [slugs, setSlugs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSlugs(getBookmarks());
    setMounted(true);
  }, []);

  const saved = slugs
    .map((slug) => resources.find((r) => r.slug === slug))
    .filter(Boolean) as (typeof resources)[number][];

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark size={20} className="text-violet-400" />
            <h1 className="text-2xl font-bold">Saved resources</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Your personal reading list — resources you bookmarked for later.
          </p>
        </div>

        {mounted && saved.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
              <Bookmark size={24} className="text-slate-500" />
            </div>
            <div>
              <p className="text-slate-300 font-medium mb-1">Nothing saved yet</p>
              <p className="text-slate-500 text-sm">
                Hit the{" "}
                <span className="text-violet-400 font-medium">Save</span> button on any resource to
                add it here.
              </p>
            </div>
            <Link
              href="/explore"
              className="mt-2 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-500/40 transition-all text-violet-300 text-sm font-medium"
            >
              Browse resources
            </Link>
          </div>
        )}

        {mounted && saved.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {saved.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        )}
      </main>
      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
