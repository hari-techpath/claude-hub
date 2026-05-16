import { NextRequest, NextResponse } from "next/server";
import { getBySlug, getRelated } from "@/lib/resources";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const resource = getBySlug(slug);

  if (!resource) {
    return NextResponse.json(
      { error: "Resource not found" },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  const related = getRelated(resource, 3).map((r) => r.slug);

  return NextResponse.json(
    { data: resource, related },
    { headers: CORS_HEADERS }
  );
}
