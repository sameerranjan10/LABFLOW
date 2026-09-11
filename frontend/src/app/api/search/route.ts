import { NextResponse } from "next/server";
import { globalSearch } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || searchParams.get("query") || "";

    const results = globalSearch(q);
    return NextResponse.json({
      success: true,
      query: q,
      results,
      source: "LabFlow Persistent Database",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Global search failed", details: String(error) },
      { status: 500 }
    );
  }
}
