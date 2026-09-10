import { NextResponse } from "next/server";
import { getAuditLogs, addAuditLog } from "@/lib/db";
import { fetchPatientAuditLogs, saveClinicalAuditLog } from "@/lib/supabase";

export async function GET() {
  try {
    const dbLogs = getAuditLogs();
    const supabaseLogs = await fetchPatientAuditLogs().catch(() => []);

    // Combine local DB logs and Supabase logs
    const combined = [
      ...dbLogs.map((l) => ({
        id: l.id,
        timestamp: l.timestamp,
        user: l.user,
        role: l.role,
        action: l.action,
        entity: "LIMS Database",
        entityId: l.id,
        location: l.location || "Main Reference Lab",
        details: l.details,
      })),
      ...supabaseLogs.map((s, idx) => ({
        id: s.id || `aud-sp-${idx}`,
        timestamp: s.createdAt || new Date().toISOString(),
        user: s.patientName ? `Tech for ${s.patientName}` : "System Automator",
        role: "Lab Auditor",
        action: s.drugConflictDetected ? "Safety Flag Audit" : "Execution Audit Verified",
        entity: "AI Pipeline",
        entityId: s.scenarioId || `SCEN-${idx}`,
        location: "Main Reference Lab",
        details: `Model: ${s.modelUsed}, Latency: ${s.latencyMs}ms`,
      })),
    ];

    return NextResponse.json({
      success: true,
      count: combined.length,
      logs: combined,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch audit logs", details: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    addAuditLog({
      action: body.action || "USER_ACTION",
      user: body.user || "Lab User",
      role: body.role || "Technologist",
      details: body.details || "Action logged",
      location: body.location || "Main Reference Lab",
    });

    // Also attempt Supabase sync if clinical entry
    if (body.scenarioId) {
      await saveClinicalAuditLog(body).catch(() => {});
    }

    return NextResponse.json({ success: true, message: "Audit log recorded" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to save audit log", details: String(err) },
      { status: 500 }
    );
  }
}
