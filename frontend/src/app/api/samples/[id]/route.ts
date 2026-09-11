import { NextResponse } from "next/server";
import { getSampleById } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sample = getSampleById(id);
    if (!sample) {
      return NextResponse.json(
        { success: false, error: `Sample ${id} not found` },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      sample,
      source: "LabFlow Persistent Database",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch sample", details: String(error) },
      { status: 500 }
    );
  }
}
