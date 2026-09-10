import { NextResponse } from "next/server";
import { getTestResults, verifyTestResult, createOrUpdateTestResult } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId") || undefined;
    const results = getTestResults(orderId);
    return NextResponse.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch test results", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if this is an analyzer result ingestion payload
    if (body.result) {
      const saved = createOrUpdateTestResult(body.result);
      return NextResponse.json({
        success: true,
        message: `Auto-analyzer result for ${saved.orderId} ingested successfully`,
        result: saved,
      });
    }

    // Otherwise, verify/sign-off result
    const { resultId, reviewer, comments } = body;
    const verified = verifyTestResult(resultId, reviewer, comments);
    if (!verified) {
      return NextResponse.json(
        { success: false, error: "Failed to verify result" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test result for ${verified.orderId} verified and signed off`,
      result: verified,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Operation failed", details: String(error) },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const resultData = body.result || body;
    const saved = createOrUpdateTestResult(resultData);
    return NextResponse.json({
      success: true,
      message: `Test result for ${saved.orderId} updated`,
      result: saved,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to ingest result", details: String(error) },
      { status: 400 }
    );
  }
}

