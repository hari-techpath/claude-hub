import { NextRequest } from "next/server";
import { getBySlug } from "@/lib/resources";
import { TYPE_META } from "@/lib/types";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Wrap text at ~maxChars per line, return array of lines (max maxLines)
function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (lines.length >= maxLines) break;
    if ((current + (current ? " " : "") + word).length <= maxChars) {
      current += (current ? " " : "") + word;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const resource = getBySlug(slug);
  if (!resource) return new Response("Not found", { status: 404 });

  const meta = TYPE_META[resource.type];
  const accentColor = meta.color;

  const name = escapeXml(resource.name);
  const taglineLines = wrapText(resource.tagline, 58, 2).map(escapeXml);
  const typeLabel = escapeXml(meta.label);
  const typeIcon = meta.icon;
  const starsFormatted =
    resource.stars >= 1000
      ? (resource.stars / 1000).toFixed(1).replace(/\.0$/, "") + "k"
      : String(resource.stars);

  const taglineY1 = 280;
  const taglineY2 = 310;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#030712"/>
      <stop offset="100%" stop-color="#0d1320"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Subtle grid pattern -->
  <rect width="1200" height="630" fill="none"
    stroke="rgba(255,255,255,0.03)" stroke-width="1"
    rx="0"/>

  <!-- Gradient accent bar at top -->
  <rect x="0" y="0" width="1200" height="5" fill="url(#accent)"/>

  <!-- Left accent glow blob -->
  <ellipse cx="120" cy="315" rx="300" ry="200"
    fill="${accentColor}" fill-opacity="0.04"/>

  <!-- Type badge pill -->
  <rect x="60" y="60" width="160" height="44" rx="22"
    fill="${meta.bg}" stroke="${meta.border}" stroke-width="1.5"/>
  <text x="90" y="88" font-family="system-ui,-apple-system,sans-serif"
    font-size="22" fill="${accentColor}">${typeIcon}</text>
  <text x="118" y="88" font-family="system-ui,-apple-system,sans-serif"
    font-size="18" font-weight="600" fill="${accentColor}">${typeLabel}</text>

  <!-- Resource name -->
  <text x="60" y="220" font-family="system-ui,-apple-system,sans-serif"
    font-size="56" font-weight="800" fill="#f1f5f9" letter-spacing="-1">${name}</text>

  <!-- Tagline line 1 -->
  <text x="60" y="${taglineY1}" font-family="system-ui,-apple-system,sans-serif"
    font-size="26" fill="#94a3b8">${taglineLines[0] ?? ""}</text>
  ${
    taglineLines[1]
      ? `<text x="60" y="${taglineY2}" font-family="system-ui,-apple-system,sans-serif"
    font-size="26" fill="#94a3b8">${taglineLines[1]}</text>`
      : ""
  }

  <!-- Stars badge -->
  <rect x="60" y="360" width="160" height="40" rx="8"
    fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <text x="80" y="386" font-family="system-ui,-apple-system,sans-serif"
    font-size="20" fill="#facc15">&#x2605;</text>
  <text x="105" y="386" font-family="system-ui,-apple-system,sans-serif"
    font-size="18" font-weight="600" fill="#e2e8f0">${starsFormatted} stars</text>

  <!-- Divider -->
  <line x1="60" y1="540" x2="1140" y2="540"
    stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  <!-- Branding: lightning bolt + Claude Hub -->
  <text x="60" y="590" font-family="system-ui,-apple-system,sans-serif"
    font-size="22" fill="${accentColor}">&#x26A1;</text>
  <text x="88" y="590" font-family="system-ui,-apple-system,sans-serif"
    font-size="22" font-weight="700" fill="#e2e8f0">Claude Hub</text>
  <text x="220" y="590" font-family="system-ui,-apple-system,sans-serif"
    font-size="18" fill="#475569">claude-hub.vercel.app</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
