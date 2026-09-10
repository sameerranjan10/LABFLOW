import { NextResponse } from "next/server";
import { getAlerts, dismissAlert } from "@/lib/db";

export async function GET() {
  try {
    const alerts = getAlerts();
    return NextResponse.json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch alerts", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing alert ID" }, { status: 400 });
    }

    if (id.toLowerCase() === "all") {
      const db = (await import("@/lib/db")).readDatabase();
      const count = (db.alerts || []).length;
      db.alerts = [];
      (await import("@/lib/db")).writeDatabase(db);
      return NextResponse.json({
        success: true,
        message: `All ${count} alerts dismissed`,
      });
    }

    const dismissed = dismissAlert(id);
    return NextResponse.json({
      success: dismissed,
      message: dismissed ? `Alert ${id} dismissed` : `Alert ${id} not found`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to dismiss alert", details: String(error) },
      { status: 500 }
    );
  }
}
