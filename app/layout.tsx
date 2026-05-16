import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import KeyboardShortcuts from "@/components/keyboard-shortcuts";
import ScrollProgress from "@/components/scroll-progress";
import { RESOURCES } from "@/lib/resources";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030712",
};

export const metadata: Metadata = {
  title: "Claude Hub — Claude Resources for Data Professionals",
  description: `${RESOURCES.length} Claude resources for data professionals — MCPs, skills, agents, prompts, and tricks for data engineers, data scientists, analysts, and ML engineers. Curated, trending, searchable.`,
  keywords: ["Claude", "MCP", "data engineering", "data science", "SQL", "Python", "dbt", "Snowflake", "Claude Code", "AI agents"],
  authors: [{ name: "Claude Hub" }],
  openGraph: {
    title: "Claude Hub — Claude for data professionals",
    description: `${RESOURCES.length} Claude resources for data engineers, scientists, and analysts`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Hub",
    description: `${RESOURCES.length} Claude resources for data engineers, scientists, and analysts`,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('ch-theme');if(t==='light')document.documentElement.classList.add('light');}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        <ScrollProgress />
        {children}
        <KeyboardShortcuts />
      </body>
    </html>
  );
}
