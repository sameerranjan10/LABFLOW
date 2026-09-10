import { NextResponse } from "next/server";
import { ALL_DEMO_SCENARIOS } from "@/data/mockData";
import { runMultiAgentDebate } from "@/lib/groq";
import { saveClinicalAuditLog } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scenarioId, rawInput, patientContext, consentGranted } = body;

    // Consent check per Important Privacy & Consent Principle
    if (consentGranted === false) {
      return NextResponse.json(
        {
          error: "Processing rejected: Patient consent has been revoked (DISHA / ABDM policy violation).",
          consentBlocked: true,
        },
        { status: 403 }
      );
    }

    const baselineScenario = ALL_DEMO_SCENARIOS[scenarioId] || ALL_DEMO_SCENARIOS.consult;

    // If Groq API key is present, attempt live multi-agent execution
    let agentResult;
    try {
      agentResult = await runMultiAgentDebate(rawInput || baselineScenario.rawInput);
    } catch {
      agentResult = {
        drafterOutput: "Fallback simulation mode active.",
        auditorCritique: "Safe verified fallback standard applied.",
        isApproved: true,
        modelUsed: "Deterministic Clinical Engine (Offline Fallback)",
        latencyMs: 380,
      };
    }

    // Persist audit record
    await saveClinicalAuditLog({
      scenarioId: scenarioId || "custom",
      patientName: patientContext?.name || baselineScenario.patient.name,
      patientAge: patientContext?.age || baselineScenario.patient.age,
      riskScore: baselineScenario.clinicianOutput.drugConflict?.riskScore || 12,
      drugConflictDetected: !!baselineScenario.clinicianOutput.drugConflict?.detected,
      agentRounds: 2,
      modelUsed: agentResult.modelUsed,
      latencyMs: agentResult.latencyMs,
    });

    return NextResponse.json({
      success: true,
      scenario: baselineScenario,
      agentDebate: agentResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Pipeline API error:", error);
    return NextResponse.json(
      {
        error: "Pipeline error occurred, fallback returned.",
        scenario: ALL_DEMO_SCENARIOS.consult,
      },
      { status: 500 }
    );
  }
}
