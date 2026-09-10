import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export interface ClinicalAuditEntry {
  id?: string;
  scenarioId: string;
  patientName: string;
  patientAge: number;
  riskScore: number;
  drugConflictDetected: boolean;
  agentRounds: number;
  modelUsed: string;
  latencyMs: number;
  createdAt?: string;
}

// In-memory fallback store for local demo resilience
const memoryAuditLog: ClinicalAuditEntry[] = [];

/**
 * Persists an execution trace for compliance & audit tracking (DISHA / ABDM & HIPAA)
 */
export async function saveClinicalAuditLog(entry: ClinicalAuditEntry): Promise<{ success: boolean; id: string }> {
  const generatedId: string = entry.id || `audit-${Date.now()}`;
  const timestamp: string = entry.createdAt || new Date().toISOString();

  const timestampedEntry: ClinicalAuditEntry = {
    ...entry,
    id: generatedId,
    createdAt: timestamp,
  };

  if (!supabase) {
    // Store in memory for hackathon session
    memoryAuditLog.unshift(timestampedEntry);
    console.info("[Audit] Saved to local memory fallback:", generatedId);
    return { success: true, id: generatedId };
  }

  try {
    const { data, error } = await supabase
      .from("clinical_audits")
      .insert([timestampedEntry])
      .select()
      .single();

    if (error) {
      console.warn("Supabase insert error, fell back to local store:", error.message);
      memoryAuditLog.unshift(timestampedEntry);
      return { success: true, id: generatedId };
    }

    const returnedId: string = (data && typeof data === "object" && "id" in data && typeof data.id === "string")
      ? data.id
      : generatedId;

    return { success: true, id: returnedId };
  } catch (err) {
    console.warn("Supabase connection failed, using local store:", err);
    memoryAuditLog.unshift(timestampedEntry);
    return { success: true, id: generatedId };
  }
}

/**
 * Retrieves audit logs for the clinical session
 */
export async function fetchPatientAuditLogs(): Promise<ClinicalAuditEntry[]> {
  if (!supabase) {
    return [...memoryAuditLog];
  }

  try {
    const { data, error } = await supabase
      .from("clinical_audits")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error || !data) {
      return [...memoryAuditLog];
    }
    return data as ClinicalAuditEntry[];
  } catch {
    return [...memoryAuditLog];
  }
}
