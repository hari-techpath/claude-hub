import { NextRequest, NextResponse } from "next/server";
import { RESOURCES, getByType, getTrending, getHot, getNew, getTop } from "@/lib/resources";
import { localSearch } from "@/lib/search";
import { ResourceType } from "@/lib/types";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const type = searchParams.get("type");
  const q = searchParams.get("q");
  const sort = searchParams.get("sort") ?? "trending";
  const limitParam = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
  const limit = isNaN(limitParam) || limitParam < 1 ? 20 : limitParam;
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  let results = RESOURCES.slice();

  // Text search takes precedence over sort
  if (q?.trim()) {
    results = localSearch(q);
  } else {
    // Sort
    switch (sort) {
      case "stars":
        results = getTop();
        break;
      case "trending":
        results = getTrending();
        break;
      case "new":
        results = getNew();
        break;
      default:
        results = getTrending();
    }
  }

  // Filter by type
  if (type) {
    results = results.filter((r) => r.type === (type as ResourceType));
  }

  const total = results.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, pages);
  const offset = (safePage - 1) * limit;
  const data = results.slice(offset, offset + limit);

  return NextResponse.json(
    {
      data,
      meta: {
        total,
        page: safePage,
        limit,
        pages,
      },
    },
    { headers: CORS_HEADERS }
  );
}
