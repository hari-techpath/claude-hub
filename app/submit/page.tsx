"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Github, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";

const RESOURCE_TYPES = ["MCP", "Skill", "Agent", "Prompt", "Architecture", "Setup", "Hook", "Trick"];

export default function SubmitPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", type: "", githubUrl: "", tagline: "", description: "", author: "", useCases: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const issueBody = encodeURIComponent(
      `## Resource Submission\n\n**Name:** ${form.name}\n**Type:** ${form.type}\n**GitHub URL:** ${form.githubUrl}\n**Tagline:** ${form.tagline}\n**Description:** ${form.description}\n**Author:** ${form.author}\n**Use Cases:** ${form.useCases}\n\n---\n*Submitted via ClaudeHub*`
    );
    window.open(`https://github.com/hari-techpath/claude-hub/issues/new?title=Resource+Submission:+${encodeURIComponent(form.name)}&body=${issueBody}&labels=resource-submission`, "_blank");
    setSubmitted(true);
  };

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6">
            <Sparkles size={13} /> Submit a resource
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Share a resource</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Know a Claude MCP, skill, agent, or trick that data professionals should know about?
            Submit it and help the community discover it.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Resource name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. PostgreSQL MCP"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-200 placeholder-slate-600 text-sm outline-none focus:border-violet-500/50 transition-colors" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Type *</label>
                  <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-200 text-sm outline-none focus:border-violet-500/50 transition-colors">
                    <option value="">Select type...</option>
                    {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">GitHub URL *</label>
                <input required type="url" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                  placeholder="https://github.com/owner/repo"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-200 placeholder-slate-600 text-sm outline-none focus:border-violet-500/50 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">One-line tagline *</label>
                <input required value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  placeholder="What does it do in one sentence?"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-200 placeholder-slate-600 text-sm outline-none focus:border-violet-500/50 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Description *</label>
                <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe what it does, who it's for, and why it's useful..."
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-200 placeholder-slate-600 text-sm outline-none focus:border-violet-500/50 transition-colors resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Author / org</label>
                  <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="GitHub username or org"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-200 placeholder-slate-600 text-sm outline-none focus:border-violet-500/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Use cases</label>
                  <input value={form.useCases} onChange={(e) => setForm({ ...form, useCases: e.target.value })}
                    placeholder="e.g. SQL, data-engineering"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-200 placeholder-slate-600 text-sm outline-none focus:border-violet-500/50 transition-colors" />
                </div>
              </div>

              <button type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-medium text-sm transition-all">
                <Github size={15} /> Open GitHub issue to submit <ArrowRight size={14} />
              </button>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center p-10 rounded-3xl bg-white/[0.02] border border-white/[0.07]">
              <CheckCircle size={40} className="text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Submission opened!</h2>
              <p className="text-slate-400 text-sm">A GitHub issue has been opened with your resource details. We review submissions weekly.</p>
            </motion.div>
          )}
        </motion.div>
      </main>
      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
