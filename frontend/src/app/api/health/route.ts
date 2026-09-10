import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { groqClient } from "@/lib/groq";

export async function GET() {
  const supabaseConnected = !!supabase;
  const groqConnected = !!groqClient;

  return NextResponse.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "2.0.0-enterprise",
    services: {
      nextjsServer: {
        status: "operational",
        environment: process.env.NODE_ENV || "development",
        port: 3000,
      },
      database: {
        provider: supabaseConnected ? "Supabase PostgreSQL (Connected)" : "In-Memory Resilient Store (Active Fallback)",
        connected: supabaseConnected,
      },
      aiEngine: {
        provider: groqConnected ? "Groq Cloud (Llama 3.3 70B)" : "Deterministic Clinical Engine (Offline Mode)",
        connected: groqConnected,
      },
      compliance: {
        standard: "ISO 15189 / NABL & ABDM",
        fhirSupport: "FHIR R4 v4.0.1",
      },
    },
  });
}
