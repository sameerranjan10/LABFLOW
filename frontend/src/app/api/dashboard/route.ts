import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = getDashboardSummary();
    return NextResponse.json({
      success: true,
      ...data,
      source: "LabFlow Persistent Database",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard summary", details: String(error) },
      { status: 500 }
    );
  }
}
