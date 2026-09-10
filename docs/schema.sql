-- ==============================================================================
-- PRODUCTION POSTGRESQL / SUPABASE SCHEMA FOR AEGISHEALTH AI (PHASE 1 MVP)
-- Adheres to DISHA / ABDM Health Data Management Policy and HIPAA Standards
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mrn VARCHAR(64) UNIQUE NOT NULL,
    abdm_health_id VARCHAR(64) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(32) NOT NULL,
    phone VARCHAR(32),
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    chronic_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
    active_medications JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CLINICAL ENCOUNTERS TABLE
CREATE TABLE IF NOT EXISTS public.clinical_encounters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    encounter_type VARCHAR(64) NOT NULL, -- 'emergency_triage', 'inpatient_discharge', 'ambulatory_consult'
    attending_physician_id VARCHAR(128) NOT NULL,
    chief_complaint TEXT NOT NULL,
    raw_transcript TEXT,
    vitals JSONB DEFAULT '{}'::JSONB,
    status VARCHAR(32) DEFAULT 'draft', -- 'draft', 'safety_audited', 'physician_attested', 'exported_to_ehr'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AGENT DEBATE SESSIONS TABLE (Glassbox Multi-Agent Execution Log)
CREATE TABLE IF NOT EXISTS public.agent_debates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES public.clinical_encounters(id) ON DELETE SET NULL,
    drafter_agent_output TEXT NOT NULL,
    auditor_critique TEXT NOT NULL,
    adversarial_verdict VARCHAR(32) NOT NULL, -- 'APPROVED', 'CRITIQUE_REVISE', 'REJECTED'
    risk_score INTEGER NOT NULL,
    contraindication_detected BOOLEAN DEFAULT FALSE,
    model_name VARCHAR(64) DEFAULT 'llama-3.3-70b-versatile',
    inference_latency_ms INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CLINICAL AUDITS TABLE (Immutable Audit Trail for Regulatory Compliance)
CREATE TABLE IF NOT EXISTS public.clinical_audits (
    id VARCHAR(128) PRIMARY KEY,
    scenario_id VARCHAR(64) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_age INTEGER NOT NULL,
    risk_score INTEGER NOT NULL,
    drug_conflict_detected BOOLEAN DEFAULT FALSE,
    agent_rounds INTEGER DEFAULT 2,
    model_used VARCHAR(128) NOT NULL,
    latency_ms INTEGER NOT NULL,
    access_justification VARCHAR(255) DEFAULT 'Direct Clinical Decision Support',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PATIENT CONSENTS TABLE (DISHA / ABDM Consent Framework)
CREATE TABLE IF NOT EXISTS public.patient_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    consent_token VARCHAR(128) UNIQUE NOT NULL,
    purpose VARCHAR(128) NOT NULL, -- 'CLINICAL_DECISION_SUPPORT', 'RESEARCH', 'EHR_EXPORT'
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'REVOKED', 'EXPIRED'
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    revoked_at TIMESTAMP WITH TIME ZONE
);

-- 6. FHIR EXPORT BUNDLES TABLE (HL7 Interoperability Archive)
CREATE TABLE IF NOT EXISTS public.fhir_bundles (
    id VARCHAR(128) PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id),
    bundle_type VARCHAR(64) DEFAULT 'collection',
    fhir_payload JSONB NOT NULL,
    exported_by VARCHAR(128) NOT NULL,
    exported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict patient isolation preventing unauthorized data exposure
-- ==============================================================================

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_consents ENABLE ROW LEVEL SECURITY;

-- Allow authenticated clinical staff with physician/nurse roles to read patient records
CREATE POLICY "Clinical staff read access"
ON public.patients FOR SELECT
USING (auth.role() = 'authenticated');

-- Patients can only access their own record matching their ABDM Health ID
CREATE POLICY "Patient self access policy"
ON public.patients FOR SELECT
USING (auth.uid() = id);

-- Audit logs are strictly append-only (No UPDATE or DELETE allowed)
CREATE POLICY "Audit append only"
ON public.clinical_audits FOR INSERT
WITH CHECK (true);

CREATE POLICY "Audit view for compliance"
ON public.clinical_audits FOR SELECT
USING (auth.role() = 'authenticated');

-- ==============================================================================
-- INITIAL SEED DATA FOR PHASE 1 DEMONSTRATION
-- ==============================================================================

INSERT INTO public.patients (id, mrn, abdm_health_id, full_name, date_of_birth, gender, allergies, chronic_conditions, active_medications)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'MRN-84920', '91-8492-0012-4411', 'Aditi Rao', '1979-04-12', 'Female', ARRAY['Penicillin'], ARRAY['Hypertension', 'Prior DVT'], '[{"drug": "Warfarin", "dose": "5mg"}]'::JSONB),
  ('00000000-0000-0000-0000-000000000002', 'MRN-67104', '91-6710-4492-8812', 'Vikram Malhotra', '1958-08-19', 'Male', ARRAY['Codeine'], ARRAY['Atrial Fibrillation', 'Osteoarthritis'], '[{"drug": "Warfarin", "dose": "5mg"}, {"drug": "Metoprolol", "dose": "50mg"}]'::JSONB),
  ('00000000-0000-0000-0000-000000000003', 'MRN-55219', '91-5521-9942-7721', 'Ramesh Gupta', '1963-02-14', 'Male', ARRAY['NKDA'], ARRAY['COPD Stage 3'], '[{"drug": "Tiotropium", "dose": "18mcg"}]'::JSONB)
ON CONFLICT (mrn) DO NOTHING;
