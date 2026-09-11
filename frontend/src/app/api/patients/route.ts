import { NextResponse } from "next/server";
import { getPatients, createPatient } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = getPatients(query, page, limit);
    return NextResponse.json({
      success: true,
      ...result,
      source: "LabFlow Persistent Database",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch patients", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const patient = createPatient(body);
    return NextResponse.json(
      {
        success: true,
        message: "Patient registered successfully in database",
        patient,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to register patient", details: String(error) },
      { status: 400 }
    );
  }
}
