import { NextResponse } from "next/server";
import { getTestCatalog, addTestPanel } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tests = getTestCatalog();
    return NextResponse.json({
      success: true,
      count: tests.length,
      tests,
      source: "LabFlow Persistent Database",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch test catalog", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const catalog = addTestPanel(body);
    return NextResponse.json(
      {
        success: true,
        message: "Diagnostic test panel added to catalog",
        catalog,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to add test panel", details: String(error) },
      { status: 400 }
    );
  }
}
