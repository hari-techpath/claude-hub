"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, Zap, Menu, X, Shuffle, ChevronDown } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";

interface NavProps {
  onSearchOpen?: () => void;
}

const PRIMARY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/stacks", label: "Stacks" },
  { href: "/explore?type=mcp", label: "MCPs" },
  { href: "/submit", label: "Submit" },
];

const MORE_LINKS = [
  { href: "/explore?type=skill", label: "Skills" },
  { href: "/explore?type=agent", label: "Agents" },
  { href: "/collections", label: "Collections" },
  { href: "/paths", label: "Paths" },
  { href: "/weekly", label: "Weekly" },
  { href: "/build", label: "Build" },
  { href: "/graph", label: "Graph" },
  { href: "/battle", label: "Battle" },
  { href: "/stats", label: "Stats" },
  { href: "/changelog", label: "Changelog" },
  { href: "/authors", label: "Authors" },
  { href: "/saved", label: "Saved" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/tags", label: "Tags" },
  { href: "/matrix", label: "Matrix" },
  { href: "/compare", label: "Compare" },
  { href: "/about", label: "About" },
];

const ALL_DESKTOP_LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/stacks", label: "Stacks" },
  { href: "/collections", label: "Collections" },
  { href: "/saved", label: "Saved" },
  { href: "/explore?type=mcp", label: "MCPs" },
  { href: "/explore?type=skill", label: "Skills" },
  { href: "/explore?type=agent", label: "Agents" },
  { href: "/build", label: "Build" },
  { href: "/graph", label: "Graph" },
  { href: "/weekly", label: "Weekly" },
  { href: "/changelog", label: "Changelog" },
  { href: "/submit", label: "Submit" },
];

export default function Nav({ onSearchOpen }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onSearchOpen?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSearchOpen]);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    if (moreOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moreOpen]);

  return (
    <header
      className={`no-print fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#030712]/90 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg group-hover:shadow-violet-500/25 transition-shadow">
            <Zap size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-base tracking-tight">
            Claude<span className="gradient-text">Hub</span>
          </span>
        </Link>

        {/* md: nav — primary links + More dropdown */}
        <nav className="hidden md:flex lg:hidden items-center gap-1">
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-100 rounded-md hover:bg-white/[0.06] transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* More dropdown */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-100 rounded-md hover:bg-white/[0.06] transition-colors"
            >
              More
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}
              />
            </button>

            {moreOpen && (
              <div className="absolute top-full left-0 mt-2 w-44 rounded-xl border border-white/[0.1] bg-[#0c0f1a]/95 backdrop-blur-xl shadow-2xl py-1.5 z-50">
                {MORE_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMoreOpen(false)}
                    className="block px-4 py-2 text-sm text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* lg: nav — all links */}
        <nav className="hidden lg:flex items-center gap-1">
          {ALL_DESKTOP_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-100 rounded-md hover:bg-white/[0.06] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onSearchOpen}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.14] transition-all text-slate-400 hover:text-slate-300 text-sm"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded bg-white/[0.06] text-slate-500 font-mono border border-white/[0.08]">
              ⌘K
            </kbd>
          </button>

          <a
            href="/random"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.14] transition-all text-slate-400 hover:text-slate-300 text-sm"
            title="Random resource"
          >
            <Shuffle size={14} />
            <span>Random</span>
          </a>

          <Link
            href="/submit"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-500/40 transition-all text-violet-300 text-sm font-medium"
          >
            Submit
          </Link>

          <button
            className="md:hidden p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#030712]/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {[
              { href: "/", label: "Home" },
              { href: "/explore", label: "Explore All" },
              { href: "/stacks", label: "Stacks" },
              { href: "/collections", label: "Collections" },
              { href: "/saved", label: "Saved" },
              { href: "/explore?type=mcp", label: "MCPs" },
              { href: "/explore?type=skill", label: "Skills" },
              { href: "/explore?type=agent", label: "Agents" },
              { href: "/explore?type=prompt", label: "Prompts" },
              { href: "/build", label: "Build" },
              { href: "/weekly", label: "Weekly" },
              { href: "/changelog", label: "Changelog" },
              { href: "/submit", label: "Submit" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-slate-400 hover:text-slate-100 rounded-md hover:bg-white/[0.06] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
