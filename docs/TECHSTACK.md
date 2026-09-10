# Technical Stack Specification & Integration Architecture

## 1. Dependency Table

| Layer | Tool / Package | Version | Hackathon Reasoning & Purpose |
|---|---|---|---|
| **Frontend Framework** | `Next.js` (App Router) | `15.2.1` | Instant server rendering, zero-boilerplate route handlers, streaming support. |
| **UI Primitives & Styling** | `Tailwind CSS v4` + `clsx` + `tailwind-merge` | `4.0.x` | Modern CSS-in-JS without build overhead; clinical tokenization. |
| **Iconography** | `lucide-react` | `1.42.0` | Comprehensive medical, clinical, and interaction icon set with tree-shaking. |
| **Motion & Transitions** | `framer-motion` | `12.4.x` | Declarative transitions for Live Thought-Chain Stepper and Dual-Persona toggle. |
| **LLM Inference Engine** | `Groq Cloud` (`groq-sdk`) | `1.6.0` | Sub-500ms token generation (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`); prevents demo spinner dead air. |
| **Database & Auth** | `Supabase` (`@supabase/supabase-js`) | `2.49.x` | Managed Postgres, Row-Level Security for clinical audit logs, zero backend server needed. |
| **Interoperability Standard** | `FHIR R4` (JSON Bundle) | `R4 v4.0.1` | Native EHR interoperability for Patient, Observation, MedicationRequest, and Condition resources. |
| **Fallback Engine** | `Synthetic Mock Data` | In-Memory | 100% deterministic fallback guaranteeing flawless offline demo execution under Wi-Fi drops. |

## 2. Environment Variables Specification (`.env.example`)

```bash
# Groq Cloud API Key (Get at https://console.groq.com)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Supabase Configuration (Optional for persistence, fallback is enabled)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Directory & Folder Structure

```
utkarsh/
├── docs/
│   ├── PRD.md               # Product Requirements Document
│   ├── DESIGN.md            # Clinical Design Tokens & Anti-AI aesthetic rules
│   └── TECHSTACK.md         # Technical architecture & API contracts
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with Geist font tokens
│   │   ├── page.tsx         # Universal Split-Screen Clinical Dashboard
│   │   └── globals.css      # Clinical slate tokens, custom scrollbars
│   ├── components/
│   │   ├── SplitScreenDashboard.tsx   # Master 2-pane coordinator
│   │   ├── TopNavBar.tsx              # Brand, status, dual-persona toggle, FHIR modal trigger
│   │   ├── IngestionPanel.tsx         # Multi-modal input tabs & file dropzone
│   │   ├── ScenarioPills.tsx          # 1-Click preset demo buttons
│   │   ├── PatientContextCard.tsx     # Demographics, vitals badges, active medication list
│   │   ├── ThoughtChain.tsx           # Glassbox animated multi-agent stepper
│   │   ├── DualPersonaView.tsx        # Clinician SOAP Note vs Patient View
│   │   ├── ClinicalAlerts.tsx         # Adversarial drug-drug interaction warning box
│   │   ├── FhirExportModal.tsx        # FHIR R4 Bundle dialog with JSON copy/download
│   │   └── StatusBar.tsx              # Bottom latency & compliance telemetry bar
│   ├── data/
│   │   └── mockData.ts      # Scenarios A (ER), B (Conflict), C (Discharge)
│   └── lib/
│       ├── groq.ts          # Groq client with adversarial drafter/auditor helpers
│       ├── supabase.ts      # Supabase client with clinical audit logger
│       ├── fhir.ts          # FHIR R4 Bundle generator & validator
│       └── utils.ts         # ClassNames & formatting helpers
├── .env.example
├── package.json
└── README.md
```

## 4. End-to-End Data Flow Architecture

```
[ CLINICAL INGESTION ]
  ├── 1-Click Scenario Pills (ER Triage / Drug Conflict / Discharge Summary)
  ├── Multimodal Input (Text Transcript / Audio Simulator / Dropzone OCR)
          │
          ▼
[ STAGE 1: INGESTION & DE-IDENTIFICATION ]
  ├── Strip PHI / PII (DISHA / ABDM & HIPAA compliance)
  ├── Extract Entities: Vitals (LOINC), Active Drugs (RxNorm), Symptoms
          │
          ▼
[ STAGE 2: MULTI-AGENT DEBATE PROTOCOL (Groq Llama 3.3 70B / Fallback Engine) ]
  ├── Agent A: Clinical Drafter
  │     └─ Generates preliminary SOAP note & management plan
  │
  ├── Agent B: Adversarial Safety Auditor
  │     └─ Queries contraindications & dosage limits
  │     └─ Evaluates Drug-Drug Interactions (e.g. Warfarin + Ibuprofen)
  │     └─ If Conflict Detected: Returns CRITIQUE & flags Risk Score (82%)
  │     └─ If Safe: Emits "APPROVED"
          │
          ▼
[ STAGE 3: LIVE THOUGHT-CHAIN STEPPER ]
  ├── Streams steps: [✓] PHI De-identified ➔ [✓] RxNorm ➔ [!] Safety Critique ➔ [✓] Synthesized
          │
          ▼
[ STAGE 4: DUAL-PERSONA RENDERING CANVAS ]
  ├── Clinician Mode: Dense SOAP note, ICD-10 codes, red-highlighted contraindication alert
  └── Patient Mode: 5th-grade reading level summary, morning/evening pill schedule, warning signs
          │
          ▼
[ STAGE 5: EHR INTEROPERABILITY (FHIR R4) ]
  └── Generates valid FHIR Bundle (Patient + Observation + MedicationRequest + Condition)
  └── Copy to clipboard or download as .json
```

## 5. API Contracts (P0 Functional Requirements)

### Endpoint: `/api/pipeline/run` (Client-Side Pipeline Hook)
- **Method**: `POST` (or client-side direct orchestration)
- **Request Shape**:
  ```typescript
  interface PipelineRequest {
    scenarioId: "consult" | "conflict" | "discharge" | "custom";
    rawInput: string;
    patientContext: {
      name: string;
      age: number;
      gender: string;
      vitals?: { bp: string; hr: number; temp: string; spo2: string };
      activeMeds?: string[];
    };
  }
  ```
- **Response Shape**:
  ```typescript
  interface PipelineResponse {
    thoughtSteps: Array<{
      id: number;
      label: string;
      status: "completed" | "warning" | "in_progress";
      timestamp: string;
      detail?: string;
    }>;
    clinicianOutput: {
      soap: { subjective: string; objective: string; assessment: string; plan: string };
      icd10Codes: Array<{ code: string; display: string }>;
      drugConflict?: {
        detected: boolean;
        severity: "CRITICAL" | "MAJOR" | "MODERATE" | "NONE";
        riskScore: number;
        drugA: string;
        drugB: string;
        mechanism: string;
        counterActions: string[];
      };
    };
    patientOutput: {
      readingLevel: string;
      plainSummary: string;
      pillSchedule: Array<{ drug: string; dose: string; timing: string; instruction: string }>;
      warningSigns: string[];
    };
    fhirBundle: object;
  }
  ```
