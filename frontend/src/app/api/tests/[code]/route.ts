import { NextResponse } from "next/server";
import { updateTestCatalogItem, deleteTestCatalogItem } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const updated = updateTestCatalogItem(code, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Test panel ${code} not found` },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: `Test panel ${code} updated`,
      test: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update test panel", details: String(error) },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const deleted = deleteTestCatalogItem(code);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `Test panel ${code} not found` },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: `Test panel ${code} removed from catalog`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete test panel", details: String(error) },
      { status: 400 }
    );
  }
}
