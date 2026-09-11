import { NextResponse } from "next/server";
import { getOrderTimeline } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const timeline = getOrderTimeline(id);
    return NextResponse.json({
      success: true,
      timeline,
      source: "LabFlow Persistent Database",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch order timeline", details: String(error) },
      { status: 500 }
    );
  }
}
