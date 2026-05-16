import Link from "next/link";
import { Zap, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="no-print border-t border-white/[0.06] mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                <Zap size={14} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-sm">
                Claude<span className="gradient-text">Hub</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
              The community registry for Claude resources. Built by the community, for the community.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
              >
                <Github size={15} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
              >
                <Twitter size={15} />
              </a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Resources</div>
            <ul className="space-y-2.5">
              {[
                { href: "/explore?type=mcp", label: "MCPs" },
                { href: "/explore?type=skill", label: "Skills" },
                { href: "/explore?type=agent", label: "Agents" },
                { href: "/explore?type=prompt", label: "Prompts" },
                { href: "/explore?type=architecture", label: "Architectures" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More */}
          <div>
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">More</div>
            <ul className="space-y-2.5">
              {[
                { href: "/about", label: "About" },
                { href: "/collections", label: "Collections" },
                { href: "/stacks", label: "Stacks" },
                { href: "/explore?type=setup", label: "Setups" },
                { href: "/explore?type=hook", label: "Hooks" },
                { href: "/explore?type=trick", label: "Tricks" },
                { href: "/graph", label: "Graph" },
                { href: "/matrix", label: "Matrix" },
                { href: "/explore", label: "All resources" },
                { href: "/tags", label: "Tags" },
                { href: "/authors", label: "Authors" },
                { href: "/api-docs", label: "API" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Submit */}
          <div>
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Contribute</div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Know a great resource that's missing? Submit a PR to add it.
            </p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 text-violet-300 text-xs font-medium transition-all"
            >
              <Github size={12} />
              Submit a resource
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            © 2025 ClaudeHub. Open source. Not affiliated with Anthropic.
          </p>
          <p className="text-xs text-slate-600">
            Built for data professionals and AI builders everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
