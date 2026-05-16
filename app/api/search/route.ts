import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { RESOURCES } from "@/lib/resources";
import { Resource } from "@/lib/types";

const client = new Anthropic();

export async function POST(req: NextRequest) {
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

    const text = message.content[0].type === "text" ? message.content[0].text : "[]";
    const slugs: string[] = JSON.parse(text.trim());
    const results: Resource[] = slugs
      .map((slug) => RESOURCES.find((r) => r.slug === slug))
      .filter((r): r is Resource => !!r);

    return NextResponse.json({ results });
  } catch (err) {
    console.error("AI search error:", err);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
