import { NextRequest } from "next/server";
import { getBySlug } from "@/lib/resources";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const resource = getBySlug(slug);
  if (!resource) return new Response("Not found", { status: 404 });

  // Escape XML special chars
  const name = resource.name
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="32">
  <rect width="200" height="32" rx="6" fill="#0a0a0a"/>
  <rect width="200" height="32" rx="6" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
  <text x="12" y="21" font-family="system-ui,-apple-system,sans-serif" font-size="13" fill="#e2e8f0">&#x26A1; ${name}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
