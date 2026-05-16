"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "ch-theme";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  // Sync state from DOM on mount (the inline script may have already applied the class)
  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const html = document.documentElement;
    const goLight = html.classList.contains("light") === false;
    if (goLight) {
      html.classList.add("light");
      localStorage.setItem(STORAGE_KEY, "light");
    } else {
      html.classList.remove("light");
      localStorage.setItem(STORAGE_KEY, "dark");
    }
    setIsDark(!goLight);
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.14] transition-all text-slate-400 hover:text-slate-300"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
