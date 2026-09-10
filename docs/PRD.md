# Product Requirements Document (PRD) — Universal Clinical Decision Support Engine

## 1. Executive Summary
A multi-agent, glassbox clinical intelligence platform delivering sub-second clinical drafting, adversarial contraindication auditing, and bilingual dual-persona synthesis (Clinician SOAP note vs. Patient 5th-grade plain language). Built for emergency triage, polypharmacy conflict resolution, and acute discharge translation, enabling healthcare teams to pivot to any hackathon challenge under 90 seconds.

## 2. Problem Statement
Preventable Adverse Drug Events (ADEs) and clinical documentation burdens cause over 1.3 million emergency visits annually and cost healthcare systems over $40 billion, with India witnessing over 5 lakh severe drug-drug interaction incidents each year due to non-standardized EHRs and fragmented regional discharge records. Over 62% of patients fail to understand their discharge instructions, directly contributing to avoidable 30-day readmissions.

## 3. User Personas
### Persona 1: Dr. Priya Sharma
- **Age**: 38
- **Role**: Emergency Medicine Attending Physician, Level-1 Trauma Hospital
- **Pain Point**: High cognitive overload, rapid triage turnover (<4 mins/patient), risk of missing subtle drug-drug contraindications in polypharmacy patients.
- **Tech Literacy**: High clinical familiarity, low tolerance for slow "AI spinners" or conversational chatbot fluff.
- **Primary Device**: Hospital Desktop Workstation & Dual Monitor Setup.

### Persona 2: Rajesh Patel
- **Age**: 62
- **Role**: Chronic Disease Patient (Type 2 Diabetes, Hypertension, Atrial Fibrillation on Warfarin)
- **Pain Point**: Overwhelmed by jargon-heavy clinical instructions, fear of internal bleeding, inability to read complex prescription instructions.
- **Tech Literacy**: Moderate (uses WhatsApp and UPI on Android).
- **Primary Device**: Mid-range Android smartphone.

### Persona 3: Sunita Nair
- **Age**: 31
- **Role**: Senior Clinical Nurse Coordinator / Discharge Specialist
- **Pain Point**: Manages 15+ concurrent patient discharges daily, manual transcription of doctor notes into patient take-home summaries, risk of medication schedule misunderstandings.
- **Tech Literacy**: High operational EHR literacy (Epic/Cerner/NIC e-Hospital).
- **Primary Device**: Nursing Station Tablet / Laptop on Wheels.

## 4. Core User Journeys
### Dr. Priya Sharma (ER Triage & Safety Verification)
1. Doctor opens emergency intake case or selects 1-Click Scenario Pill (`ER Triage` or `Drug Conflict`).
2. Reviews patient vitals, chief complaint, and active medications in the adaptive Left Pane.
3. Clicks "Run Multi-Agent Pipeline".
4. Observes live Thought-Chain Stepper verify PHI redaction, RxNorm indexing, and adversarial safety critique.
5. Reviews generated SOAP note with ICD-10 codes and red-highlighted contraindication warnings.
6. Clicks "Export to EHR (FHIR)" to push standardized bundle to hospital core EHR.

### Rajesh Patel (Patient Take-Home Summary & Understanding)
1. Patient or family caregiver receives digital discharge link on mobile.
2. Views the "Patient View" displaying a 5th-grade reading level explanation of what happened.
3. Reviews simplified medication cards with visual morning/night dosage indicators.
4. Checks plain-language warning signs (e.g. "Call doctor immediately if you notice unusual dark bruising or dark stools").
5. Toggles regional language preview (Hindi / Telugu / English).

### Sunita Nair (Discharge Reconciliation & Interoperability)
1. Coordinates patient discharge by ingesting physician's discharge audio/text summary.
2. Verifies adversarial safety audit approved the medication tapering schedule (e.g., Prednisone 5-day taper).
3. Downloads the verified FHIR R4 Bundle JSON for seamless transmission to community primary care provider.

## 5. Functional Requirements
| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| **FR-01** | Multi-Modal Ingestion Canvas | P0 | Accepts raw clinical text, simulated audio transcripts, and document dropzone upload with instant parsing. |
| **FR-02** | 1-Click Demo Preset Scenarios | P0 | Instant preloading of ER Triage, Polypharmacy Conflict, and Discharge Summary without manual typing. |
| **FR-03** | Glassbox Live Thought-Chain Stepper | P0 | Visual streaming of step-by-step reasoning (`PHI Redaction` → `RxNorm Lookup` → `Safety Audit` → `Persona Synthesis`) with execution timestamps. |
| **FR-04** | Adversarial Debate Protocol | P0 | Agent A (Clinical Drafter) proposes notes, Agent B (Safety Auditor) validates contraindications; flags severity in red `#C24242` before final approval. |
| **FR-05** | Dual-Persona Output View | P0 | One-click toggle between Clinician Mode (SOAP format, ICD-10, RxNorm) and Patient Mode (Flesch-Kincaid 5th-grade level, visual pills). |
| **FR-06** | FHIR R4 Compliant Export | P0 | Generates valid FHIR Bundle JSON with `Patient`, `Observation`, `MedicationRequest`, and `Condition` resources with one-click modal viewer & download. |
| **FR-07** | Sub-500ms Groq Inference & Offline Fallback | P0 | Primary inference via Groq Llama 3.3 70B; automatic graceful fallback to deterministic mock data if API key missing or network fails. |
| **FR-08** | Supabase Clinical Audit Logging | P1 | Asynchronous storage of pipeline run metadata, risk scores, and de-identified queries with Row-Level Security. |
| **FR-09** | Regional Translation Preview | P1 | Multilingual output toggle supporting English, Hindi, and Telugu for patient discharge instructions. |

## 6. Non-Functional Requirements
- **Latency**: End-to-end multi-agent processing complete in under 1.5 seconds on live Groq Llama 3.3 70B inference; instant response with mock simulation.
- **Availability & Resilience**: Zero raw error screens. If an API request fails or Wi-Fi drops, the interface seamlessly falls back to preloaded mock verification data.
- **Data Privacy & Compliance**: Automatic PHI de-identification at ingestion point; adherence to India's DISHA / ABDM Health Data Management Policy and HIPAA standards.
- **Accessibility**: Strict compliance with WCAG 2.1 AA (high contrast ratios, keyboard navigable, screen-reader friendly).

## 7. Edge Cases & Failure Modes
1. **Network Disconnection**: Automatic failover to local synthetic mock pipeline; user receives a subtle badge indicating "Offline Sandbox Mode" with full demo functionality.
2. **OCR / Transcription Misreads Drug Name**: Fuzzy matching against RxNorm database with confidence scoring and clinician confirmation prompt.
3. **Gibberish / Malformed Input**: Input sanitization layer detects non-clinical content and gracefully prompts user for valid clinical transcript or scenario selection.
4. **Multilingual Input**: Handles code-mixed inputs (e.g., Hinglish / Telugu-English phrases) and normalizes to standard clinical entities.
5. **Silent Audio Recording (>10s)**: Audio input simulator flags empty buffer and defaults to last loaded clinical preset.
6. **Malformed FHIR Payload**: Strict schema validation ensures every generated bundle contains valid resource types, UUID identifiers, and standard coding systems (LOINC / RxNorm / ICD-10).
7. **Model Hallucination on Dosages**: Adversarial Safety Auditor Agent strictly cross-references FDA / CDSCO therapeutic dose ranges and blocks drafts with unverified dosages.
8. **Concurrent Multi-User Session Conflict**: Optimistic locking and stateless transaction handling on all pipeline executions.

## 8. Compliance & Ethical Guardrails
- **Clinical Decision Support Disclaimer**: Prominent header and footer alert: *"Antigravity AegisHealth is a Clinical Decision Support System (CDSS). It does not provide autonomous diagnostic authority. All clinical recommendations require validation by a licensed healthcare professional."*
- **De-Identification**: Names, phone numbers, and identifying demographic tokens are redacted prior to LLM submission.
- **Audit Logging**: Every prompt, agent deliberation cycle, risk score, and safety approval is timestamped for regulatory inspection.

## 9. Out-of-Scope (To Prevent Hackathon Scope Creep)
- Direct integration with proprietary hospital on-premise EHR databases (Epic, Cerner) via private VPN tunnels.
- Autonomous prescription signing or real-time pharmacy dispensing fulfillment.
- Ingestion of raw 3D DICOM radiology volumetric files (text, lab values, and vitals supported).

## 10. Success Metrics (3 Measurable Hackathon KPIs)
1. **Demo Execution Speed**: 0-to-Result in < 1.2 seconds, verifiable live during the 90-second judge presentation.
2. **Safety Detection Accuracy**: 100% detection and clear flagging of major drug-drug conflicts (e.g., Warfarin + Ibuprofen) in adversarial audit tests.
3. **Comprehension Delta**: >60% reduction in readability grade level when toggling from Clinician SOAP note (Grade 14+) to Patient View (Grade 5.2).
