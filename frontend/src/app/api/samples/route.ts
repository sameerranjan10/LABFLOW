import { NextResponse } from "next/server";
import { getSamples, updateSampleStage } from "@/lib/db";
import { LabStage } from "@/data/labflowData";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get("barcode") || undefined;
    const stage = searchParams.get("stage") || undefined;

    const samples = getSamples({ barcode, stage });

    return NextResponse.json({
      success: true,
      count: samples.length,
      samples,
      source: "LabFlow Persistent Database",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve samples from database", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { sampleId, nextStage, location, operator, notes } = body;

    if (!sampleId || !nextStage) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: sampleId and nextStage" },
        { status: 400 }
      );
    }

    const updatedSample = updateSampleStage(
      sampleId,
      nextStage as LabStage,
      operator || "Technologist",
      location,
      notes
    );

    if (!updatedSample) {
      return NextResponse.json(
        { success: false, error: `Sample ${sampleId} not found in database` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Specimen ${sampleId} advanced to ${nextStage} and written to database`,
      sample: updatedSample,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update specimen", details: String(error) },
      { status: 400 }
    );
  }
}
