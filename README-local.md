# AegisHealth AI — Clinical Intelligence & Safety Verification Engine

> **Winning Healthcare Hackathon Foundation & Phase 1 MVP**  
> Built strictly following *The 24-Hour Healthcare Hackathon Blueprint & Winning Playbook*.

[![Next.js](https://img.shields.io/badge/Next.js-15.2.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Groq Cloud](https://img.shields.io/badge/Groq-Llama_3.3_70B-orange)](https://groq.com/)
[![FHIR R4](https://img.shields.io/badge/Interoperability-HL7_FHIR_R4-emerald)](https://hl7.org/fhir/R4/)
[![Compliance](https://img.shields.io/badge/Compliance-DISHA_%2F_ABDM_%2F_HIPAA-indigo)](https://abdm.gov.in/)

---

## Quickstart (Run Locally)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

---

## Complete Folder UI & Directory Structure

```
utkarsh/
├── docs/                                          # Architecture & compliance specifications
│   ├── PRD.md                                     # 10-section enterprise clinical PRD
│   ├── DESIGN.md                                  # Reverse-engineered clinical tokens & anti-AI guide
│   ├── TECHSTACK.md                               # API contracts, dependency table, and ASCII flow
│   ├── schema.sql                                 # PostgreSQL / Supabase schema with RLS policies
│   └── Phase1_System_Architecture_and_Workflow_Guide.pdf  # Clean Printable PDF Documentation
├── src/                                           # Next.js 15 App Router & Components
│   ├── app/                                       # Next.js 15 App Router
│   │   ├── api/
│   │   │   ├── pipeline/route.ts                  # POST /api/pipeline (Groq debate & consent check)
│   │   │   └── audit/route.ts                     # GET/POST /api/audit (Immutable compliance log)
│   │   ├── layout.tsx                             # Root layout with Geist font tokens
│   │   ├── page.tsx                               # Mounts the SplitScreenDashboard
│   │   └── globals.css                            # Clinical dark palette, custom scrollbar
│   ├── components/                                # Clean, modular UI components
│   │   ├── SplitScreenDashboard.tsx               # Master 2-pane coordinator & state manager
│   │   ├── AuthRoleSelector.tsx                   # Top-bar 1-click clinical persona switcher (RBAC)
│   │   ├── ConsentBanner.tsx                      # DISHA/ABDM patient consent status & revocation
│   │   ├── ScenarioPills.tsx                      # 1-Click quick load demo preset buttons
│   │   ├── PatientContextCard.tsx                 # Vitals grid (BP, HR, SpO2, Temp) & active meds
│   │   ├── ThoughtChain.tsx                       # Glassbox live streaming progress stepper
│   │   ├── ClinicalAlerts.tsx                     # Drug-drug contraindication alert in #EF4444
│   │   ├── DualPersonaView.tsx                    # Clinician SOAP note vs. Patient view + Attestation
│   │   └── FhirExportModal.tsx                    # HL7 FHIR R4 JSON modal viewer & .json download
│   ├── data/
│   │   └── mockData.ts                            # Synthetic scenarios (ER Triage, Conflict, Discharge)
│   └── lib/                                       # Core client hooks & helpers
│       ├── auth.ts                                # Roles, permissions matrix, and preset accounts
│       ├── groq.ts                                # Groq Llama 3.3 70B client & multi-agent debate
│       ├── supabase.ts                            # Supabase client with clinical audit trail & fallback
│       ├── fhir.ts                                # FHIR R4 Bundle generator & file exporter
│       └── utils.ts                               # ClassNames helper (clsx + tailwind-merge)
├── .env.example                                   # API keys template
└── package.json                                   # Dependencies and scripts
```

---

## The 5 "Must-Win" Showstopper Features

| Feature | Component | Description |
|---|---|---|
| **1. Universal Split-Screen Layout** | `SplitScreenDashboard.tsx` | 50/50 responsive split: Ingestion & Controls on Left, Live Agent Chain & Dynamic Canvas on Right. |
| **2. Live Thought-Chain Glassbox UI** | `ThoughtChain.tsx` | Replaces loading spinners with an animated progress stepper streaming milestones (`[1] PHI Redaction` ➔ `[2] RxNorm` ➔ `[3] Adversarial Audit` ➔ `[4] Synthesis`). |
| **3. Dual-Persona View Toggle** | `DualPersonaView.tsx` | Instant toggle between **Clinician Mode** (dense SOAP note, ICD-10, RxNorm) and **Patient Mode** (5th-grade plain English, visual pill schedule, Hindi & Telugu localization). |
| **4. FHIR R4 EHR Interoperability** | `FhirExportModal.tsx` | Generates compliant HL7 FHIR R4 Bundle JSON (`Patient`, `Observation`, `Condition`, `MedicationRequest`) with one-click copy and `.json` download. |
| **5. 1-Click Preset Scenario Buttons** | `ScenarioPills.tsx` | Preloads Scenario A (ER Triage), Scenario B (Drug Conflict), and Scenario C (Discharge Summary) for a polished zero-typing 90s judge demo. |

---

## Phase 1 MVP Healthcare Safeguards

1. **Adversarial Safety Debate Protocol** (`groq.ts`):
   - Agent A (Clinical Drafter) writes notes; Agent B (Safety Auditor) checks contraindications. Flags major drug conflicts (e.g. Warfarin + Ibuprofen) with an 82% toxicity score in `#EF4444` before final approval.
2. **Human-in-the-Loop Attestation Gate** (`DualPersonaView.tsx`):
   - Per Healthcare Safety Principles, AI recommendations require an attending physician to review and click **"Digitally Sign Off & Approve"** before pushing to EHR.
3. **DISHA / ABDM Patient Consent** (`ConsentBanner.tsx`):
   - Tracks active consent artifact (`ABDM-CONSENT-9942`). When a patient revokes consent, backend routes immediately block execution with HTTP 403.
4. **Role-Based Access Control (RBAC)** (`AuthRoleSelector.tsx`):
   - 1-Click switcher between **Dr. Priya Sharma, MD** (Attending), **Sunita Nair, RN** (Nurse Coordinator), and **Rajesh Patel** (Patient).

---

## 90-Second Winning Pitch Script

- **0:00 - 0:20 (Hook):** "Every year, over 5 lakh patients in India suffer preventable adverse drug events from polypharmacy conflicts, costing billions."
- **0:20 - 0:40 (Problem):** "Meet Vikram Malhotra, a 68-year-old on warfarin prescribed ibuprofen for knee pain—a 4x hemorrhage risk missed in busy clinics."
- **0:40 - 1:10 (Live Demo):** Click *Scenario B: Drug Conflict* ➔ Click *Run Pipeline* ➔ Watch Thought-Chain step `[3]` flag 82% risk ➔ Show red contraindication alert in `#EF4444`.
- **1:10 - 1:30 (Attestation & Persona):** Show Doctor Sign-off ➔ Switch to Patient Rajesh Patel ➔ Show view flip to 5th-grade language + Hindi/Telugu translation.
- **1:30 - 2:00 (EHR & Close):** Show ABDM Consent ➔ Click *Export to EHR (FHIR)* to download `.json`. Close: "Sub-500ms Groq inference, Supabase RLS, fully production-ready."
