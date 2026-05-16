import { NextResponse, NextRequest } from "next/server";
import { RESOURCES } from "@/lib/resources";

export function GET(request: NextRequest) {
  const r = RESOURCES[Math.floor(Math.random() * RESOURCES.length)];
  return NextResponse.redirect(new URL(`/resources/${r.slug}`, request.url));
}
