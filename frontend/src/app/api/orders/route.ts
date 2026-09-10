import { NextResponse } from "next/server";
import { getOrders, createOrder } from "@/lib/db";
import { LabOrder } from "@/data/labflowData";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage") || undefined;
    const priority = searchParams.get("priority") || undefined;

    const orders = getOrders({ stage, priority });

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
      source: "LabFlow Persistent Database",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve orders from database", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: Partial<LabOrder> & { sampleType?: string; collector?: string } = await request.json();
    const { order, sample, report } = createOrder(body);

    return NextResponse.json(
      {
        success: true,
        message: "Order requisition, sample record, and diagnostic report persisted into database",
        order,
        sample,
        report,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to persist order", details: String(error) },
      { status: 400 }
    );
  }
}
