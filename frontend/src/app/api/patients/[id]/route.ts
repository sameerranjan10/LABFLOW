import { NextResponse } from "next/server";
import { getPatientById, getPatientOrders } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = getPatientById(id);
    if (!patient) {
      return NextResponse.json(
        { success: false, error: `Patient ${id} not found` },
        { status: 404 }
      );
    }
    const orders = getPatientOrders(id);

    return NextResponse.json({
      success: true,
      patient,
      orders,
      source: "LabFlow Persistent Database",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch patient details", details: String(error) },
      { status: 500 }
    );
  }
}
