import { NextResponse } from "next/server";
import { RESOURCES, getCounts, getTrending, getHot } from "@/lib/resources";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const totalResources = RESOURCES.length;
  const byType = getCounts();
  const totalStars = RESOURCES.reduce((sum, r) => sum + r.stars, 0);
  const trending = getTrending()
    .slice(0, 5)
    .map((r) => r.name);
  const hot = getHot()
    .slice(0, 5)
    .map((r) => r.name);

  return NextResponse.json(
    { totalResources, byType, totalStars, trending, hot },
    { headers: CORS_HEADERS }
  );
}
