import { NextResponse } from "next/server";
import { getPatientOrders } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orders = getPatientOrders(id);
    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
      source: "LabFlow Persistent Database",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch patient orders", details: String(error) },
      { status: 500 }
    );
  }
}
