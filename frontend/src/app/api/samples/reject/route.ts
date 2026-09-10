import { NextResponse } from "next/server";
import { rejectSample } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sampleId, reason, operator } = body;

    if (!sampleId || !reason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: sampleId and reason" },
        { status: 400 }
      );
    }

    const rejected = rejectSample(sampleId, reason, operator || "Accessioning Tech");
    if (!rejected) {
      return NextResponse.json({ success: false, error: "Sample not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Sample ${sampleId} rejected and logged in database`,
      sample: rejected,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to reject sample", details: String(error) },
      { status: 400 }
    );
  }
}
