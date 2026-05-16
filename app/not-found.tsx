"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 text-center overflow-hidden">
      {/* Aurora blobs */}
      <div className="aurora-blob w-[500px] h-[500px] bg-violet-600 -top-40 -left-40 opacity-[0.13]" />
      <div className="aurora-blob w-[400px] h-[400px] bg-blue-600 top-20 right-0 opacity-[0.11]" />
      <div className="aurora-blob w-[300px] h-[300px] bg-emerald-500 bottom-0 left-1/2 -translate-x-1/2 opacity-[0.09]" />

      <div className="relative z-10 max-w-lg mx-auto">
        {/* Big 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-[120px] sm:text-[160px] font-black leading-none mb-2 gradient-text select-none"
          aria-hidden="true"
        >
          404
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="text-2xl sm:text-3xl font-bold mb-3"
        >
          Resource not found
        </motion.h1>

        {/* Fun subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="text-slate-400 text-base mb-10 leading-relaxed"
        >
          Looks like this data pipeline has no output.
          <br />
          The page you&apos;re looking for doesn&apos;t exist — or was moved.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.26 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/25 hover:bg-violet-500/20 hover:border-violet-500/45 text-violet-300 font-medium transition-all text-sm"
          >
            <Home size={15} />
            Back to home
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.14] text-slate-300 font-medium transition-all text-sm"
          >
            <Compass size={15} />
            Explore resources
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
