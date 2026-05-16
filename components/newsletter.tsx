"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative rounded-3xl overflow-hidden border border-white/[0.1] bg-white/[0.03] backdrop-blur-xl px-8 py-12 sm:px-14 sm:py-14 text-center"
      >
        {/* Aurora glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute w-[500px] h-[500px] rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
              top: "-30%",
              left: "-10%",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-15"
            style={{
              background: "radial-gradient(circle, #0891b2 0%, transparent 70%)",
              bottom: "-20%",
              right: "-5%",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute w-[300px] h-[300px] rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, #059669 0%, transparent 70%)",
              top: "20%",
              right: "20%",
              filter: "blur(50px)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/25 mb-6">
            <Mail size={18} className="text-violet-400" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            <span className="gradient-text">New Claude resources, weekly</span>
          </h2>

          <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
            Get the best MCPs, skills, and data tools delivered to your inbox.{" "}
            <span className="text-slate-500">No spam.</span>
          </p>

          {subscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-medium text-base"
            >
              You&apos;re in! 🎉
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
            >
              <div className="relative w-full sm:flex-1 group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-slate-200 placeholder:text-slate-600 text-sm outline-none transition-all duration-200
                    focus:border-violet-500/60 focus:bg-white/[0.07]
                    focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2),0_0_20px_rgba(139,92,246,0.15)]"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-400 hover:to-blue-400 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
}
