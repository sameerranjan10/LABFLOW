import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/db";

export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = updateSettings(body);
    return NextResponse.json({
      success: true,
      message: "Platform settings persisted to database",
      settings: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update settings", details: String(error) },
      { status: 400 }
    );
  }
}
