import { NextRequest, NextResponse } from "next/server";
import { getReports } from "@/lib/db";
import { generateReportPdfBuffer } from "@/lib/pdfGenerator";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reports = getReports();
    const report = reports.find((r) => r.id === id) || reports[0];

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const pdfBuffer = await generateReportPdfBuffer(report);

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Apex_Report_${report.id}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate report PDF", details: (error as Error).message },
      { status: 500 }
    );
  }
}