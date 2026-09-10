import { NextResponse } from "next/server";
import { fetchPatientAuditLogs, saveClinicalAuditLog, type ClinicalAuditEntry } from "@/lib/supabase";

export async function GET() {
  try {
    const logs = await fetchPatientAuditLogs();
    return NextResponse.json({ success: true, count: logs.length, logs });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch logs", details: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: ClinicalAuditEntry = await request.json();
    const res = await saveClinicalAuditLog(body);
    return NextResponse.json({ success: true, id: res.id });
  } catch (err) {
    return NextResponse.json({ error: "Failed to save audit", details: String(err) }, { status: 500 });
  }
}
