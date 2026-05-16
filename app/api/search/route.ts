import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { RESOURCES } from "@/lib/resources";
import { Resource } from "@/lib/types";

// In-memory rate limiter: max 20 requests per minute per IP
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 20;
const WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) ?? []).filter(
    (t) => now - t < WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT) {
    rateLimitMap.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  // Clean up stale IPs occasionally
  if (Math.random() < 0.01) {
    for (const [key, ts] of rateLimitMap.entries()) {
      if (ts.every((t) => now - t >= WINDOW_MS)) rateLimitMap.delete(key);
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  // Gracefully handle missing API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ results: [], fallback: true }, { status: 200 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { results: [], fallback: true, error: "rate_limited" },
      { status: 429 }
    );
  }

  try {
    const { query } = await req.json();
    if (!query?.trim()) {
      return NextResponse.json({ results: [] });
    }

    const resourceSummaries = RESOURCES.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      tagline: r.tagline,
      type: r.type,
      tags: r.tags,
      useCases: r.useCases,
      description: r.description.slice(0, 100),
    }));

    let slugs: string[] = [];
    try {
      const client = new Anthropic();
      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: `You are a search assistant for a Claude resources registry. Given a user query, find the most relevant resources from this list.

User query: "${query}"

Resources (JSON):
${JSON.stringify(resourceSummaries, null, 2)}

Return ONLY a JSON array of resource slugs (max 8), ordered by relevance. Example: ["slug-1", "slug-2"]
Return only the JSON array, nothing else.`,
          },
        ],
      });

      const text =
        message.content[0].type === "text" ? message.content[0].text : "[]";
      slugs = JSON.parse(text.trim());
    } catch (aiErr) {
      console.error("AI search error:", aiErr);
      return NextResponse.json({ results: [], fallback: true }, { status: 200 });
    }

    const results: Resource[] = slugs
      .map((slug) => RESOURCES.find((r) => r.slug === slug))
      .filter((r): r is Resource => !!r);

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Search route error:", err);
    return NextResponse.json({ results: [], fallback: true }, { status: 200 });
  }
}
