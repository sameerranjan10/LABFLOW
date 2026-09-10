import { NextResponse } from "next/server";
import { triggerFailureSimulation, recoverFailureSimulation, getAlerts } from "@/lib/db";

export async function GET() {
  try {
    const alerts = getAlerts();
    const activeSimulations = alerts
      .filter((a) => a.id.startsWith("ALT-SIM-"))
      .map((a) => ({
        id: a.id,
        category: a.category,
        title: a.title,
        entityId: a.entityId,
        timestamp: a.timestamp,
      }));

    const totalSimulations = 6;
    const activeCount = activeSimulations.length;
    const systemHealthScore = Math.max(70, Math.round(100 - activeCount * 5));

    return NextResponse.json({
      success: true,
      systemHealthScore,
      activeSimulationsCount: activeCount,
      activeSimulations,
      supportedScenarios: [
        {
          id: "ANALYZER_MAINTENANCE",
          name: "Analyzer Sensor Drift & Maintenance",
          severity: "Critical",
          description: "Simulates optical flow sensor drift (>2.5 SD), automated diversion to backup workstation.",
        },
        {
          id: "SAMPLE_REJECTION",
          name: "Pre-Analytical Specimen Rejection",
          severity: "High",
          description: "Simulates gross hemolysis (Index > 500 mg/dL) and auto-generation of redraw requisition.",
        },
        {
          id: "TAT_BREACH",
          name: "STAT SLA Breach & Delay Escalation",
          severity: "Warning",
          description: "Simulates turnaround-time breach (73m elapsed vs 45m SLA) with automatic priority escalation.",
        },
        {
          id: "DUPLICATE_ORDER",
          name: "Duplicate Test Requisition Interception",
          severity: "Information",
          description: "Simulates duplicate payload submission intercepted by Idempotency Key Guard.",
        },
        {
          id: "INVALID_TRANSITION",
          name: "Illegal State Transition Violation",
          severity: "Critical",
          description: "Simulates attempt to skip accessioning/testing (ORDERED → RELEASED) blocked by state machine.",
        },
        {
          id: "DELIVERY_FAILURE",
          name: "Notification Timeout & Dead-Letter Queue (DLQ)",
          severity: "Critical",
          description: "Simulates SMTP timeout, job placement into Dead-Letter Queue (DLQ), and exponential retry backoff.",
        },
      ],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve resilience status", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action = "simulate", scenario } = body;

    if (!scenario) {
      return NextResponse.json(
        { success: false, error: "Scenario identifier is required" },
        { status: 400 }
      );
    }

    if (action === "recover") {
      const recovery = recoverFailureSimulation(scenario);
      return NextResponse.json({
        success: true,
        action: "recover",
        result: recovery,
      });
    }

    const result = triggerFailureSimulation(scenario);
    return NextResponse.json({
      success: true,
      action: "simulate",
      result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Resilience operation failed", details: String(error) },
      { status: 500 }
    );
  }
}
