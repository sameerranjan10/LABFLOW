import { NextResponse } from "next/server";
import { getReports, releaseReport } from "@/lib/db";

export async function GET() {
  try {
    const reports = getReports();
    return NextResponse.json({
      success: true,
      count: reports.length,
      reports,
      source: "LabFlow Persistent Database",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve reports", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reportId, signedBy } = body;

    if (!reportId) {
      return NextResponse.json({ success: false, error: "Missing reportId" }, { status: 400 });
    }

    const released = releaseReport(reportId, signedBy || "Dr. Arvind Swaminathan, MD");
    if (!released) {
      return NextResponse.json({ success: false, error: `Report ${reportId} not found` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Report ${reportId} attested and released`,
      report: released,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to release report", details: String(error) },
      { status: 400 }
    );
  }
}
