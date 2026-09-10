export interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: string;
  mrn: string;
  vitals?: {
    bp: string;
    hr: number;
    temp: string;
    spo2: string;
    rr?: number;
  };
  allergies?: string[];
  activeMeds?: string[];
}

export interface ThoughtStep {
  id: number;
  label: string;
  status: "done" | "warning" | "in_progress" | "pending";
  agent: "IngestionAgent" | "ClinicalDrafter" | "SafetyAuditor" | "SynthesisEngine";
  latencyMs: number;
  detail?: string;
  value?: string;
}

export interface DrugConflictData {
  detected: boolean;
  severity: "CRITICAL" | "MAJOR" | "MODERATE" | "NONE";
  riskScore: number;
  drugA: { name: string; class: string; rxnormCode: string };
  drugB: { name: string; class: string; rxnormCode: string };
  mechanism: string;
  counterActions: string[];
}

export interface ClinicalScenario {
  id: "consult" | "conflict" | "discharge";
  pillLabel: string;
  badge: string;
  title: string;
  description: string;
  patient: PatientInfo;
  rawInput: string;
  thoughtSteps: ThoughtStep[];
  clinicianOutput: {
    soap: {
      subjective: string;
      objective: string;
      assessment: string;
      plan: string;
    };
    icd10Codes: Array<{ code: string; display: string }>;
    rxNormCodes: Array<{ code: string; display: string }>;
    drugConflict?: DrugConflictData;
  };
  patientOutput: {
    readingLevel: string; // e.g. "Grade 5.1 (Flesch-Kincaid)"
    plainSummary: string;
    pillSchedule: Array<{
      drug: string;
      dose: string;
      timing: string;
      purpose: string;
      instructions: string;
    }>;
    warningSigns: string[];
    regionalTranslations?: {
      hi?: { title: string; summary: string; warning: string };
      te?: { title: string; summary: string; warning: string };
    };
  };
  fhirBundle: {
    resourceType: "Bundle";
    type: "collection";
    id: string;
    timestamp: string;
    entry: Array<{
      fullUrl: string;
      resource: Record<string, unknown>;
    }>;
  };
}

// SCENARIO A: Emergency ER Triage & Vital Signs
export const scenarioERTriage: ClinicalScenario = {
  id: "consult",
  pillLabel: "🩺 Scenario A: ER Triage & Vitals",
  badge: "Urgent Triage",
  title: "Emergency Intake & Acute Headache Triage",
  description: "Rapid intake consult of an anticoagulated patient presenting with severe persistent cephalalgia and dizziness.",
  patient: {
    id: "pat-001",
    name: "Aditi Rao",
    age: 47,
    gender: "Female",
    mrn: "MRN-84920",
    vitals: {
      bp: "138/88 mmHg",
      hr: 92,
      temp: "98.9 °F",
      spo2: "97%",
      rr: 18,
    },
    allergies: ["Penicillin (Rash)"],
    activeMeds: ["Warfarin 5mg daily", "Atorvastatin 20mg daily"],
  },
  rawInput: `[Doctor-Patient Emergency Consult Transcript]
Doctor: "What brings you into the emergency triage today, Aditi?"
Patient: "I've had this persistent throbbing headache and dizziness for the last three days. I've also been feeling unusually fatigued."
Doctor: "Any changes to your usual medications recently?"
Patient: "Well, I started taking over-the-counter ibuprofen 400mg twice a day last Thursday for severe right knee joint pain. That's in addition to my regular warfarin."
Doctor: "Understood. Because you take warfarin, taking ibuprofen can increase your bleeding risk significantly. Let's immediately check your INR levels, examine your neurological signs, and replace the NSAID with a safer pain reliever."`,
  thoughtSteps: [
    {
      id: 1,
      label: "Ingestion & PHI Redaction",
      status: "done",
      agent: "IngestionAgent",
      latencyMs: 42,
      detail: "De-identified patient identifiers per DISHA / ABDM & HIPAA guardrails.",
    },
    {
      id: 2,
      label: "Clinical Entity Extraction & LOINC Normalization",
      status: "done",
      agent: "ClinicalDrafter",
      latencyMs: 110,
      detail: "Extracted Vitals (BP 138/88, HR 92), symptoms (Headache, Dizziness), and active medications.",
    },
    {
      id: 3,
      label: "Adversarial Safety Audit (The Debate Protocol)",
      status: "warning",
      agent: "SafetyAuditor",
      latencyMs: 230,
      value: "RISK: 82%",
      detail: "Major contraindication identified: Warfarin (Anticoagulant) + Ibuprofen (NSAID) displacement conflict.",
    },
    {
      id: 4,
      label: "Dual-Persona Synthesis & FHIR R4 Bundle Serialization",
      status: "done",
      agent: "SynthesisEngine",
      latencyMs: 95,
      detail: "Generated Clinician SOAP documentation and 5th-grade patient discharge card.",
    },
  ],
  clinicianOutput: {
    soap: {
      subjective:
        "47-year-old female presenting with 3-day history of persistent throbbing headache, postural dizziness, and mild asthenia. Patient self-initiated OTC ibuprofen 400mg PO BID 5 days ago for right knee arthralgia while maintained on chronic therapeutic anticoagulation (Warfarin 5mg daily for prior DVT). Denies head trauma, focal motor weakness, syncope, or hematochezia.",
      objective:
        "Vitals: BP 138/88 mmHg, HR 92 bpm regular, Temp 98.9°F, SpO2 97% on room air, RR 18/min. Alert, oriented x 3, non-toxic appearance. Cranial nerves II-XII grossly intact. No nuchal rigidity. Pupillary reflexes equal and brisk. STAT Point-of-Care Coagulation Panel pending.",
      assessment:
        "1. Acute cephalalgia and lightheadedness in the setting of concurrent Warfarin and NSAID administration.\n2. High bleeding risk secondary to pharmacodynamic synergistic platelet inhibition and pharmacokinetic albumin displacement.\n3. Essential hypertension (mild systolic elevation).",
      plan:
        "1. Immediately discontinue Ibuprofen 400mg BID.\n2. Draw urgent STAT PT/INR, Complete Blood Count (CBC), and basic metabolic panel.\n3. Transition acute analgesic regimen to Acetaminophen (Paracetamol) 500mg PO PRN Q6H (max 2g/24h in anticoagulated patient).\n4. Neurological status checks Q2H; low threshold for non-contrast head CT if INR > 3.5 or headache escalates.\n5. Re-evaluate INR in 48-72 hours prior to anticoagulation titration.",
    },
    icd10Codes: [
      { code: "R51.9", display: "Headache, unspecified" },
      { code: "R42", display: "Dizziness and giddiness" },
      { code: "T45.515A", display: "Adverse effect of antithrombotic drugs, initial encounter" },
      { code: "Z79.01", display: "Long term (current) use of anticoagulants" },
    ],
    rxNormCodes: [
      { code: "11289", display: "Warfarin Sodium (RxNorm)" },
      { code: "5640", display: "Ibuprofen (RxNorm)" },
      { code: "161", display: "Acetaminophen (RxNorm)" },
    ],
    drugConflict: {
      detected: true,
      severity: "MAJOR",
      riskScore: 82,
      drugA: { name: "Warfarin", class: "Anticoagulant (Vitamin K Antagonist)", rxnormCode: "11289" },
      drugB: { name: "Ibuprofen", class: "Non-Steroidal Anti-Inflammatory (NSAID)", rxnormCode: "5640" },
      mechanism:
        "Ibuprofen reversibly inhibits platelet COX-1 (compromising primary hemostasis) and displaces warfarin from plasma albumin binding sites, precipitating elevated unbound active warfarin and significantly heightening gastrointestinal/intracranial hemorrhage risk.",
      counterActions: [
        "Immediately discontinue Ibuprofen and record drug conflict alert in hospital EHR.",
        "Substitute with Acetaminophen (Paracetamol) 500mg PO PRN for pain control.",
        "Perform STAT INR check and schedule repeat INR in 3-5 days.",
        "Educate patient on warning symptoms: coffee-ground emesis, melena, spontaneous bruising, or hematuria.",
      ],
    },
  },
  patientOutput: {
    readingLevel: "Grade 4.8 (Easy to Understand)",
    plainSummary:
      "You came to the ER with a bad headache and dizziness. The doctor discovered that taking ibuprofen while you are on your blood thinner (warfarin) is dangerous and can cause internal bleeding. We have stopped your ibuprofen immediately and switched you to paracetamol, which is safe for your blood thinner.",
    pillSchedule: [
      {
        drug: "Warfarin (Blood Thinner)",
        dose: "5 mg",
        timing: "Every evening at 6:00 PM",
        purpose: "Prevents harmful blood clots",
        instructions: "Take with water. Keep taking your exact regular dose.",
      },
      {
        drug: "Paracetamol (Safe Pain Relief)",
        dose: "500 mg",
        timing: "Only when needed for knee or head pain (at least 6 hours apart)",
        purpose: "Relieves pain safely without thinning your blood",
        instructions: "Do NOT take more than 4 tablets in 24 hours. NEVER take ibuprofen or aspirin.",
      },
      {
        drug: "Atorvastatin (Cholesterol)",
        dose: "20 mg",
        timing: "Nightly before bedtime",
        purpose: "Heart and vessel protection",
        instructions: "Continue regular schedule.",
      },
    ],
    warningSigns: [
      "Any dark, black, or tarry bowel movements.",
      "Sudden unusual bruising on your skin or bleeding from gums that won't stop in 5 minutes.",
      "A headache that gets suddenly worse or feels like the worst headache of your life.",
      "Feeling faint or passing out.",
    ],
    regionalTranslations: {
      hi: {
        title: "रोगी देखभाल निर्देश (सरल हिंदी)",
        summary: "आप सिरदर्द और चक्कर आने की शिकायत लेकर आए थे। डॉक्टर ने पाया कि खून पतला करने वाली दवा (वारफेरिन) के साथ आइबुप्रोफेन लेना खतरनाक है और इससे रक्तस्राव हो सकता है। आइबुप्रोफेन को तुरंत रोक दिया गया है और सुरक्षित दर्द निवारक दिया गया है।",
        warning: "यदि काला मल आए, मसूड़ों से लगातार खून बहे, या अत्यधिक चक्कर आएं तो तुरंत इमरजेंसी में आएं।",
      },
      te: {
        title: "రోగి సంరక్షణ సూచనలు (తెలుగు)",
        summary: "మీరు తలనొప్పి మరియు తలతిరగడంతో వచ్చారు. రక్తం పల్చబడే మందు (వార్ఫరిన్) తో ఐబుప్రోఫెన్ వాడటం ప్రమాదకరం. డాక్టర్ వెంటనే ఐబుప్రోఫెన్ నిలిపివేసి సురక్షితమైన మందును ఇచ్చారు.",
        warning: "మలంలో రక్తం లేదా నల్లటి రంగు కనిపించినా, చిగుళ్ల నుండి రక్తం కారినా వెంటనే ఆసుపత్రికి రండి.",
      },
    },
  },
  fhirBundle: {
    resourceType: "Bundle",
    type: "collection",
    id: "bundle-er-triage-001",
    timestamp: "2026-09-10T06:30:00Z",
    entry: [
      {
        fullUrl: "urn:uuid:patient-aditi-rao",
        resource: {
          resourceType: "Patient",
          id: "pat-001",
          identifier: [{ system: "http://hospital.org/mrn", value: "MRN-84920" }],
          active: true,
          name: [{ use: "official", family: "Rao", given: ["Aditi"] }],
          gender: "female",
          birthDate: "1979-04-12",
        },
      },
      {
        fullUrl: "urn:uuid:obs-vitals-bp",
        resource: {
          resourceType: "Observation",
          id: "obs-bp-001",
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/observation-category",
                  code: "vital-signs",
                  display: "Vital Signs",
                },
              ],
            },
          ],
          code: {
            coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood pressure panel with all children optional" }],
          },
          subject: { reference: "urn:uuid:patient-aditi-rao", display: "Aditi Rao" },
          effectiveDateTime: "2026-09-10T06:25:00Z",
          valueString: "138/88 mmHg",
        },
      },
      {
        fullUrl: "urn:uuid:condition-headache",
        resource: {
          resourceType: "Condition",
          id: "cond-headache-001",
          clinicalStatus: {
            coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }],
          },
          verificationStatus: {
            coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-ver-status", code: "confirmed" }],
          },
          code: {
            coding: [{ system: "http://hl7.org/fhir/sid/icd-10-cm", code: "R51.9", display: "Headache, unspecified" }],
          },
          subject: { reference: "urn:uuid:patient-aditi-rao" },
        },
      },
      {
        fullUrl: "urn:uuid:medrequest-paracetamol",
        resource: {
          resourceType: "MedicationRequest",
          id: "med-paracetamol-001",
          status: "active",
          intent: "order",
          medicationCodeableConcept: {
            coding: [{ system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: "161", display: "Acetaminophen 500mg Oral Tablet" }],
          },
          subject: { reference: "urn:uuid:patient-aditi-rao" },
          dosageInstruction: [
            {
              text: "Take 500mg PO PRN every 6 hours as needed for pain. Do not exceed 2000mg in 24 hours.",
            },
          ],
        },
      },
    ],
  },
};

// SCENARIO B: Polypharmacy / Drug-to-Drug Interaction Conflict
export const scenarioDrugConflict: ClinicalScenario = {
  id: "conflict",
  pillLabel: "⚠️ Scenario B: Drug-to-Drug Conflict",
  badge: "Major Safety Alert",
  title: "Polypharmacy Conflict: Warfarin + Ibuprofen Co-administration",
  description: "High-risk adverse interaction detection flagged by Adversarial Safety Auditor agent with actionable counter-measures.",
  patient: {
    id: "pat-002",
    name: "Vikram Malhotra",
    age: 68,
    gender: "Male",
    mrn: "MRN-67104",
    vitals: {
      bp: "144/90 mmHg",
      hr: 86,
      temp: "98.6 °F",
      spo2: "96%",
    },
    allergies: ["Codeine (Nausea)"],
    activeMeds: ["Warfarin 5mg daily", "Metoprolol 50mg BID", "Ibuprofen 400mg BID (Self-prescribed)"],
  },
  rawInput: `[Clinical Intake & Medication Reconciliation Record]
Patient: Vikram Malhotra, 68-year-old male on long-term systemic anticoagulation (Warfarin 5mg PO daily) for chronic Atrial Fibrillation.
Recent Prescription addition: Patient presented to walk-in orthopedics clinic with acute osteoarthritis flare-up and was started on Ibuprofen 400mg PO twice daily.
Laboratory Data: Baseline INR from 14 days ago was 2.3 (Therapeutic Range: 2.0 - 3.0).
Clinical Alert Query: Evaluate interaction toxicity between Warfarin (Anticoagulant) and Ibuprofen (NSAID).`,
  thoughtSteps: [
    {
      id: 1,
      label: "Clinical Ingestion & Medication Reconciliation",
      status: "done",
      agent: "IngestionAgent",
      latencyMs: 38,
      detail: "Identified 3 active medications: Warfarin, Metoprolol, Ibuprofen.",
    },
    {
      id: 2,
      label: "Pharmacological Cross-Reference (RxNorm + DrugBank)",
      status: "done",
      agent: "ClinicalDrafter",
      latencyMs: 88,
      detail: "Mapped Warfarin (RxNorm 11289) and Ibuprofen (RxNorm 5640).",
    },
    {
      id: 3,
      label: "Adversarial Safety Audit (Adversary Review)",
      status: "warning",
      agent: "SafetyAuditor",
      latencyMs: 310,
      value: "SEVERITY: MAJOR (82%)",
      detail: "Adversary flagged critical gastrointestinal hemorrhage risk and INR destabilization. Refused unverified co-prescription.",
    },
    {
      id: 4,
      label: "Clinical Decision Support & Countermeasure Synthesis",
      status: "done",
      agent: "SynthesisEngine",
      latencyMs: 104,
      detail: "Formulated alternative analgesia (Acetaminophen substitution) and frequent INR monitoring protocol.",
    },
  ],
  clinicianOutput: {
    soap: {
      subjective:
        "68-year-old male with chronic non-valvular atrial fibrillation maintained on Warfarin therapy. Ingested Ibuprofen 400mg BID over past 6 days for bilateral osteoarthritic knee pain. Denies overt melena, hematemesis, epistaxis, or hematuria. Reports mild epigastric discomfort after NSAID ingestion.",
      objective:
        "BP 144/90 mmHg, HR 86 bpm (irregularly irregular), SpO2 96% ambient air. Abdomen soft, mild tenderness in epigastric region without guarding or rebound. Peripheral pulses palpable.",
      assessment:
        "MAJOR DRUG INTERACTION: Warfarin + Ibuprofen.\nSynergistic antiplatelet and anticoagulant effect with displacement of protein-bound warfarin. Estimated 3.8x relative risk increase for upper gastrointestinal bleeding. Secondary risk: potential NSAID-induced acute kidney injury compounding digoxin/metoprolol clearance.",
      plan:
        "1. Deprescribe and cancel Ibuprofen immediately.\n2. Order STAT PT/INR, stool occult blood test, and renal panel (BUN/Creatinine).\n3. Prescribe Acetaminophen 650mg PO TID PRN for joint pain control.\n4. Initiate gastroprotection with Omeprazole 20mg PO daily for 14 days if epigastric distress persists.\n5. Repeat INR within 72 hours.",
    },
    icd10Codes: [
      { code: "T45.515A", display: "Adverse effect of antithrombotic drugs" },
      { code: "T39.315A", display: "Adverse effect of propionic acid derivatives (Ibuprofen)" },
      { code: "I48.91", display: "Unspecified atrial fibrillation" },
      { code: "K29.70", display: "Gastritis, unspecified, without bleeding" },
    ],
    rxNormCodes: [
      { code: "11289", display: "Warfarin Sodium (RxNorm)" },
      { code: "5640", display: "Ibuprofen (RxNorm)" },
      { code: "7646", display: "Omeprazole (RxNorm)" },
    ],
    drugConflict: {
      detected: true,
      severity: "MAJOR",
      riskScore: 82,
      drugA: { name: "Warfarin", class: "Anticoagulant (Vitamin K Antagonist)", rxnormCode: "11289" },
      drugB: { name: "Ibuprofen", class: "Non-Steroidal Anti-Inflammatory (NSAID)", rxnormCode: "5640" },
      mechanism:
        "Ibuprofen inhibits platelet aggregation via COX-1 blockade and competitively displaces warfarin from plasma protein binding sites, increasing free circulating warfarin concentration. Combination multiplies gastrointestinal ulceration and severe bleeding risk by nearly fourfold.",
      counterActions: [
        "Substitute Ibuprofen with Acetaminophen (Paracetamol) for osteoarthritic pain management (max 2g/day).",
        "If NSAID therapy is strictly unavoidable, switch to a topical agent or increase INR monitoring to every 3-5 days.",
        "Prescribe short-term gastroprotective PPI (Omeprazole 20mg once daily).",
        "Instruct patient and family on signs of concealed GI bleeding: dark tarry stools, coffee-ground emesis, unusual bruising.",
      ],
    },
  },
  patientOutput: {
    readingLevel: "Grade 5.0 (Clear & Actionable)",
    plainSummary:
      "WARNING: Your doctor identified a serious clash between two of your medicines: Warfarin (your blood thinner) and Ibuprofen (your knee pain medicine). Taking both medicines together can make you bleed inside your stomach. STOP taking Ibuprofen right now. Your doctor has switched you to a safe pain reliever called paracetamol.",
    pillSchedule: [
      {
        drug: "STOP: Ibuprofen",
        dose: "400 mg",
        timing: "DO NOT TAKE ANYMORE",
        purpose: "DANGEROUS with your blood thinner",
        instructions: "Throw away or set aside your remaining ibuprofen pills immediately.",
      },
      {
        drug: "Acetaminophen / Paracetamol",
        dose: "650 mg",
        timing: "Morning and Evening as needed for knee pain",
        purpose: "Safe pain relief for joint stiffness",
        instructions: "Do not take more than 3 tablets in one day.",
      },
      {
        drug: "Warfarin",
        dose: "5 mg",
        timing: "Every evening at 6:00 PM with water",
        purpose: "Protects your heart from blood clots",
        instructions: "Continue taking your normal dose.",
      },
    ],
    warningSigns: [
      "Stomach pain that feels like a burning sensation.",
      "Black or tar-colored bowel movements.",
      "Vomiting material that looks like dark coffee grounds.",
      "Cuts that bleed for longer than 10 minutes without stopping.",
    ],
  },
  fhirBundle: {
    resourceType: "Bundle",
    type: "collection",
    id: "bundle-drug-conflict-002",
    timestamp: "2026-09-10T06:31:00Z",
    entry: [
      {
        fullUrl: "urn:uuid:patient-vikram-malhotra",
        resource: {
          resourceType: "Patient",
          id: "pat-002",
          identifier: [{ system: "http://hospital.org/mrn", value: "MRN-67104" }],
          name: [{ use: "official", family: "Malhotra", given: ["Vikram"] }],
          gender: "male",
          birthDate: "1958-08-19",
        },
      },
      {
        fullUrl: "urn:uuid:allergy-drug-interaction",
        resource: {
          resourceType: "Basic",
          id: "alert-warfarin-ibuprofen",
          code: {
            coding: [{ system: "http://hl7.org/fhir/ValueSet/clinical-decision-support", code: "drug-drug-interaction", display: "Major Drug-Drug Interaction" }],
          },
          subject: { reference: "urn:uuid:patient-vikram-malhotra" },
        },
      },
    ],
  },
};

// SCENARIO C: Discharge Summary Jargon Simplification & Regional Translation
export const scenarioDischargeSummary: ClinicalScenario = {
  id: "discharge",
  pillLabel: "📄 Scenario C: Discharge & Translation",
  badge: "Discharge & Translation",
  title: "Inpatient COPD Exacerbation Discharge Summary",
  description: "Translates complex multi-day inpatient hospital course and steroid taper into 5th-grade bilingual take-home instructions.",
  patient: {
    id: "pat-003",
    name: "Ramesh Gupta",
    age: 63,
    gender: "Male",
    mrn: "MRN-55219",
    vitals: {
      bp: "128/82 mmHg",
      hr: 76,
      temp: "98.4 °F",
      spo2: "95% (Room Air)",
      rr: 16,
    },
    allergies: ["No Known Drug Allergies (NKDA)"],
    activeMeds: ["Tiotropium inhaler 18mcg daily", "Prednisone 20mg tapering", "Azithromycin 250mg daily"],
  },
  rawInput: `[Hospital Inpatient Discharge Summary Note]
Patient: Ramesh Gupta, 63-year-old male.
Admission Reason: Acute exacerbation of Chronic Obstructive Pulmonary Disease (COPD) with community-acquired secondary bacterial pneumonia.
Hospital Course: Patient presented via ambulance with acute dyspnea, productive purulent cough, and severe hypoxemia (SpO2 88% on ambient air). Promptly initiated on IV Ceftriaxone and Azithromycin, nebulized bronchodilators (Albuterol/Ipratropium Q4H), and systemic IV methylprednisolone 40mg. Sputum cultures grew Streptococcus pneumoniae. Oxygenation steadily normalized over 96 hours. Patient now ambulating with SpO2 95% on room air.
Discharge Diagnoses:
1. COPD exacerbation (ICD-10: J44.1)
2. Community-acquired pneumonia (ICD-10: J18.9)
Discharge Medications:
- Oral Prednisone: 20mg daily for 2 days, then 10mg daily for 2 days, then 5mg daily for 1 day, then stop.
- Oral Azithromycin: 250mg daily to complete 5-day course (2 days remaining).
- Tiotropium (Spiriva) inhaler: 18mcg (1 inhalation daily ongoing).
Follow-Up: Pulmonology outpatient clinic in 14 days. Repeat chest radiograph in 6 weeks.`,
  thoughtSteps: [
    {
      id: 1,
      label: "Clinical Discharge Record Ingestion",
      status: "done",
      agent: "IngestionAgent",
      latencyMs: 45,
      detail: "Parsed hospital course, discharge medications, and taper intervals.",
    },
    {
      id: 2,
      label: "Steroid Tapering & Regimen Verification",
      status: "done",
      agent: "ClinicalDrafter",
      latencyMs: 95,
      detail: "Structured 5-day Prednisone stepwise reduction schedule.",
    },
    {
      id: 3,
      label: "Safety & Compliance Audit",
      status: "done",
      agent: "SafetyAuditor",
      latencyMs: 140,
      value: "APPROVED",
      detail: "Confirmed steroid taper prevents adrenal insufficiency; antibiotic duration verified.",
    },
    {
      id: 4,
      label: "Plain-Language Translation & Regional Localization",
      status: "done",
      agent: "SynthesisEngine",
      latencyMs: 112,
      detail: "Synthesized 5th-grade English, Hindi, and Telugu discharge schedules.",
    },
  ],
  clinicianOutput: {
    soap: {
      subjective:
        "63-year-old male with severe COPD admitted 4 days ago with acute infective exacerbation and community-acquired pneumonia. Reports marked resolution of dyspnea, resolution of fever, and significant reduction in sputum purulence. Tolerating oral intake and ambulating without supplemental oxygen.",
      objective:
        "Discharge Vitals: BP 128/82, HR 76, RR 16, SpO2 95% on room air, Temp 98.4°F. Chest auscultation: Clear breath sounds bilaterally with prolonged expiratory phase consistent with baseline COPD; coarse rhonchi cleared. Labs: WBC normalized to 7.4 x10^9/L.",
      assessment:
        "Resolved acute exacerbation of COPD secondary to Streptococcus pneumoniae pneumonia. Clinically stable for safe home discharge with stepwise oral corticosteroid taper and outpatient respiratory follow-up.",
      plan:
        "1. Complete oral Prednisone step-down taper over 5 days (20mg x2d, 10mg x2d, 5mg x1d, then discontinue).\n2. Complete oral Azithromycin 250mg daily (2 days remaining).\n3. Continue maintenance Tiotropium bromide 18mcg inhaler (1 puff daily).\n4. Outpatient Pulmonology consultation in 2 weeks.\n5. Follow-up post-pneumonia chest X-ray in 6 weeks to ensure complete radiographic clearance.",
    },
    icd10Codes: [
      { code: "J44.1", display: "Chronic obstructive pulmonary disease with (acute) exacerbation" },
      { code: "J18.9", display: "Pneumonia, unspecified organism" },
      { code: "Z87.891", display: "Personal history of nicotine dependence" },
    ],
    rxNormCodes: [
      { code: "8640", display: "Prednisone (RxNorm)" },
      { code: "18631", display: "Azithromycin (RxNorm)" },
      { code: "262188", display: "Tiotropium (RxNorm)" },
    ],
  },
  patientOutput: {
    readingLevel: "Grade 4.9 (Simple Take-Home Guide)",
    plainSummary:
      "Mr. Gupta, your lungs have healed well from the chest infection and lung swelling that brought you into the hospital. You are ready to go home! To prevent your breathing troubles from coming back, follow your daily medicine schedule carefully. Take your steroid pills exactly as they step down each day.",
    pillSchedule: [
      {
        drug: "Prednisone (Swelling Reducer)",
        dose: "Step-down Taper",
        timing: "Every morning with breakfast",
        purpose: "Calms lung swelling",
        instructions:
          "Day 1 & 2: Take 1 full tablet (20mg). Day 3 & 4: Take half a tablet (10mg). Day 5: Take quarter tablet (5mg). Then STOP.",
      },
      {
        drug: "Azithromycin (Antibiotic)",
        dose: "250 mg",
        timing: "Once daily with lunch for 2 more days",
        purpose: "Kills remaining bacteria",
        instructions: "Finish both remaining days completely even if you feel 100% fine.",
      },
      {
        drug: "Spiriva / Tiotropium (Inhaler)",
        dose: "1 puff (18 mcg)",
        timing: "Every morning after rinsing mouth",
        purpose: "Keeps airways wide open",
        instructions: "Do not swallow capsules. Breathe in deeply through your inhaler.",
      },
    ],
    warningSigns: [
      "Shortness of breath that gets worse when resting or talking.",
      "Fever returning above 100.4 °F (38 °C).",
      "Coughing up thick green or brown mucus.",
      "Chest pain when taking deep breaths.",
    ],
    regionalTranslations: {
      hi: {
        title: "डिस्चार्ज निर्देश — घर पर देखभाल (हिंदी)",
        summary: "गुप्ता जी, अस्पताल में आपके फेफड़ों का संक्रमण अब काफी ठीक हो चुका है और आप घर जाने के लिए तैयार हैं। सांस की तकलीफ दोबारा न हो, इसके लिए अपनी दवाओं का सही समय पर सेवन करें।",
        warning: "यदि सांस लेने में दोबारा कठिनाई हो, तेज बुखार आए या सीने में दर्द हो तो तुरंत डॉक्टर से संपर्क करें।",
      },
      te: {
        title: "డిశ్చార్జ్ సూచనలు (తెలుగు)",
        summary: "గుప్తా గారూ, మీ ఊపిరితిత్తుల ఇన్ఫెక్షన్ నయమైంది మరియు మీరు క్షేమంగా ఇంటికి వెళ్ళవచ్చు. మీ ఉబ్బసం మళ్లీ రాకుండా ఉండటానికి మందుల పట్టికను ఖచ్చితంగా పాటించండి.",
        warning: "ఆయాసం పెరిగినా, తీవ్రమైన జ్వరం లేదా ఛాతీ నొప్పి వచ్చినా వెంటనే ఆసుపత్రికి తిరిగి రండి.",
      },
    },
  },
  fhirBundle: {
    resourceType: "Bundle",
    type: "collection",
    id: "bundle-discharge-summary-003",
    timestamp: "2026-09-10T06:32:00Z",
    entry: [
      {
        fullUrl: "urn:uuid:patient-ramesh-gupta",
        resource: {
          resourceType: "Patient",
          id: "pat-003",
          identifier: [{ system: "http://hospital.org/mrn", value: "MRN-55219" }],
          name: [{ use: "official", family: "Gupta", given: ["Ramesh"] }],
          gender: "male",
          birthDate: "1963-02-14",
        },
      },
      {
        fullUrl: "urn:uuid:condition-copd",
        resource: {
          resourceType: "Condition",
          id: "cond-copd-001",
          clinicalStatus: {
            coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }],
          },
          code: {
            coding: [{ system: "http://hl7.org/fhir/sid/icd-10-cm", code: "J44.1", display: "COPD with acute exacerbation" }],
          },
          subject: { reference: "urn:uuid:patient-ramesh-gupta" },
        },
      },
      {
        fullUrl: "urn:uuid:condition-pneumonia",
        resource: {
          resourceType: "Condition",
          id: "cond-pneumonia-001",
          clinicalStatus: {
            coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "resolving" }],
          },
          code: {
            coding: [{ system: "http://hl7.org/fhir/sid/icd-10-cm", code: "J18.9", display: "Pneumonia, unspecified organism" }],
          },
          subject: { reference: "urn:uuid:patient-ramesh-gupta" },
        },
      },
      {
        fullUrl: "urn:uuid:medrequest-prednisone",
        resource: {
          resourceType: "MedicationRequest",
          id: "med-prednisone-001",
          status: "active",
          intent: "order",
          medicationCodeableConcept: {
            coding: [{ system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: "8640", display: "Prednisone Oral Tablet" }],
          },
          subject: { reference: "urn:uuid:patient-ramesh-gupta" },
          dosageInstruction: [
            {
              text: "Taper over 5 days: 20mg PO daily for 2 days, 10mg PO daily for 2 days, 5mg PO daily for 1 day, then stop.",
            },
          ],
        },
      },
    ],
  },
};

export const ALL_DEMO_SCENARIOS: Record<string, ClinicalScenario> = {
  consult: scenarioERTriage,
  conflict: scenarioDrugConflict,
  discharge: scenarioDischargeSummary,
};
