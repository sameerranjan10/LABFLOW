import fs from "fs";
import path from "path";
import {
  INITIAL_ORDERS,
  INITIAL_SAMPLES,
  INITIAL_ALERTS,
  INITIAL_REPORTS,
  INITIAL_EXCEPTIONS,
  INITIAL_WORKFLOW_STAGES,
  INITIAL_TEAM,
  DEMO_TEST_RESULT,
  LabOrder,
  LabSample,
  LabReport,
  AlertItem,
  ExceptionItem,
  WorkflowStageMetric,
  TestResult,
  ResultParameter,
  TeamMember,
  LabStage,
} from "@/data/labflowData";

export interface LabSettings {
  organization: {
    name: string;
    license: string;
    address: string;
    email: string;
  };
  billing: {
    plan: "starter" | "professional" | "enterprise";
    usedQuota: number;
    maxQuota: number;
    renewsAt: string;
  };
  testCatalog: Array<{
    code: string;
    name: string;
    loinc: string;
    dept: string;
    tat: string;
    price: string;
    status: string;
  }>;
  collectionCenters: Array<{
    code: string;
    name: string;
    address: string;
    phone: string;
    capacity: string;
    status: string;
  }>;
}

export interface SentEmailRecord {
  id: string;
  reportId: string;
  recipientEmail: string;
  recipientName: string;
  patientName: string;
  subject: string;
  timestamp: string;
  status: "Delivered" | "Pending" | "Failed";
  messageId: string;
  notes?: string;
}

export interface SentWhatsAppRecord {
  id: string;
  reportId: string;
  recipientPhone: string;
  recipientName: string;
  patientName: string;
  message: string;
  timestamp: string;
  status: "Delivered" | "Sent" | "Pending" | "Failed";
  messageId: string;
  directLink?: string;
  notes?: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  mrn: string;
  address?: string;
  allergies?: string[];
  vitals?: {
    bp: string;
    hr: number;
    spo2: string;
    temp: string;
  };
  activeMeds?: string[];
  createdAt?: string;
  orderCount?: number;
  latestActivity?: string;
}

export interface LabDatabase {
  orders: LabOrder[];
  samples: LabSample[];
  alerts: AlertItem[];
  reports: LabReport[];
  exceptions: ExceptionItem[];
  workflowStages: WorkflowStageMetric[];
  results: TestResult[];
  team: TeamMember[];
  patients?: PatientRecord[];
  sentEmails: SentEmailRecord[];
  sentWhatsApp?: SentWhatsAppRecord[];
  settings: LabSettings;
  auditLogs: Array<{
    id: string;
    timestamp: string;
    action: string;
    user: string;
    role: string;
    details: string;
    location?: string;
  }>;
  version: string;
  lastUpdated: string;
}

const DB_FILE_PATH = path.join(process.cwd(), "src", "data", "labflow_db.json");

function getInitialDatabase(): LabDatabase {
  return {
    orders: [...INITIAL_ORDERS],
    samples: [...INITIAL_SAMPLES],
    alerts: [...INITIAL_ALERTS],
    reports: [...INITIAL_REPORTS],
    exceptions: [...INITIAL_EXCEPTIONS],
    workflowStages: [...INITIAL_WORKFLOW_STAGES],
    results: [DEMO_TEST_RESULT],
    team: [...INITIAL_TEAM],
    sentEmails: [],
    sentWhatsApp: [],
    settings: {
      organization: {
        name: "Apex Diagnostics & Reference Laboratories",
        license: "NABL-LAB-2026-8492",
        address: "Plot 14, Healthcare Hub, Main Boulevard",
        email: "ops@apexdiagnostics.com",
      },
      billing: {
        plan: "professional",
        usedQuota: 3842,
        maxQuota: 5000,
        renewsAt: "2026-10-01",
      },
      testCatalog: [
        { code: "CBC-01", name: "Complete Blood Count (CBC)", loinc: "58410-2", dept: "Hematology", tat: "45m", price: "$28", status: "Active" },
        { code: "CMP-02", name: "Comprehensive Metabolic Panel", loinc: "24323-8", dept: "Biochemistry", tat: "60m", price: "$42", status: "Active" },
        { code: "LIP-03", name: "Lipid Profile Standard", loinc: "57698-3", dept: "Biochemistry", tat: "40m", price: "$35", status: "Active" },
        { code: "TROP-04", name: "Troponin I High-Sensitivity (STAT)", loinc: "49563-0", dept: "Immunoassay", tat: "25m", price: "$55", status: "Active" },
        { code: "HBA1C-05", name: "Glycated Hemoglobin (HbA1c)", loinc: "4548-4", dept: "Diabetes Care", tat: "30m", price: "$32", status: "Active" },
        { code: "TSH-06", name: "Thyroid Stimulating Hormone", loinc: "3016-3", dept: "Endocrinology", tat: "50m", price: "$38", status: "Active" },
        { code: "URIN-07", name: "Urinalysis Routine & Microscopic", loinc: "24356-8", dept: "Clinical Path", tat: "30m", price: "$22", status: "Active" },
        { code: "COV-08", name: "RT-PCR Viral Multiplex Panel", loinc: "94500-6", dept: "Molecular Lab", tat: "120m", price: "$65", status: "Active" },
      ],
      collectionCenters: [
        { code: "CC-01", name: "Main Reference Lab (Central Processing)", address: "Plot 14, Health Park", phone: "+91 80 4920 1100", capacity: "1,500/day", status: "Primary Hub" },
        { code: "CC-02", name: "City Center Collection Hub", address: "Suite 302, Metro Towers", phone: "+91 80 4920 1102", capacity: "400/day", status: "Active Branch" },
        { code: "CC-03", name: "Westside Outpatient Clinic Center", address: "19 West End Ave, 1st Floor", phone: "+91 80 4920 1103", capacity: "350/day", status: "Active Branch" },
        { code: "CC-04", name: "Emergency Hospital Satellite Lab", address: "Wing B, Trauma Floor", phone: "+91 80 4920 1199", capacity: "600/day", status: "STAT Only" },
      ],
    },
    auditLogs: [
      {
        id: "AUD-INIT-001",
        timestamp: "2026-09-10T09:00:00Z",
        action: "DATABASE_INITIALIZATION",
        user: "System Bootstrap",
        role: "System",
        details: "LabFlow persistent laboratory operations database initialized.",
        location: "Main Reference Lab",
      },
    ],
    version: "3.0.0-integrated",
    lastUpdated: new Date().toISOString(),
  };
}

export function readDatabase(): LabDatabase {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const initialDb = getInitialDatabase();
      writeDatabase(initialDb);
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE_PATH, "utf-8");
    const parsed = JSON.parse(data);
    // Backward compatibility merge if keys are missing
    const initialDb = getInitialDatabase();
    return {
      ...initialDb,
      ...parsed,
      team: parsed.team || initialDb.team,
      sentEmails: parsed.sentEmails || initialDb.sentEmails || [],
      sentWhatsApp: parsed.sentWhatsApp || initialDb.sentWhatsApp || [],
      settings: parsed.settings || initialDb.settings,
      results: parsed.results || initialDb.results,
    };
  } catch (error) {
    console.error("[LabFlow DB] Read error, using in-memory baseline:", error);
    return getInitialDatabase();
  }
}

export function writeDatabase(db: LabDatabase): boolean {
  try {
    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("[LabFlow DB] Write error:", error);
    return false;
  }
}

// ORDER OPERATIONS
export function getOrders(filter?: { stage?: string; priority?: string }): LabOrder[] {
  const db = readDatabase();
  let result = db.orders;
  if (filter?.stage) {
    result = result.filter((o) => o.currentStage === filter.stage);
  }
  if (filter?.priority) {
    result = result.filter((o) => o.priority.toLowerCase() === filter.priority?.toLowerCase());
  }
  return result;
}

export function createOrder(order: Partial<LabOrder> & { sampleType?: string; collector?: string }): {
  order: LabOrder;
  sample: LabSample;
  report: LabReport;
  result?: TestResult;
} {
  const db = readDatabase();

  const orderId = order.id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
  const sampleId = order.sampleId || `SMP-${Math.floor(20000 + Math.random() * 80000)}`;
  const sampleType = order.sampleType || "Whole Blood (EDTA)";
  const collector = order.collector || "Sunita Verma";

  const newOrder: LabOrder = {
    id: orderId,
    sampleId: sampleId,
    patient: order.patient ? {
      ...order.patient,
      email: order.patient.email || "",
    } : {
      id: `PAT-${Date.now().toString().slice(-4)}`,
      name: "Anonymous Patient",
      age: 40,
      gender: "Male",
      phone: "+91 98765 43210",
      mrn: `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
      email: "",
    },
    tests: order.tests && order.tests.length > 0 ? order.tests : ["Complete Blood Count (CBC)"],
    priority: order.priority || "Normal",
    currentStage: "ORDERED",
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    createdDate: new Date().toISOString().split("T")[0],
    tat: "15m",
    status: "In Progress",
    location: order.location || "Main Reference Lab (Central)",
    doctorName: order.doctorName || "Dr. Priya Sharma, MD",
  };

  const newSample: LabSample = {
    id: sampleId,
    orderId: orderId,
    patient: newOrder.patient,
    sampleType: sampleType,
    test: newOrder.tests.join(", "),
    currentLocation: "Phlebotomy Intake - Reception",
    stage: "ORDERED",
    collectedAt: newOrder.createdAt,
    tat: "15m",
    status: "Collected",
    barcode: `LBF-${newOrder.patient.id}`,
    volume: "3.0 mL",
    timeline: [
      {
        id: `tl-evt-${Date.now()}`,
        timestamp: newOrder.createdAt,
        date: newOrder.createdDate,
        event: "Specimen Requisition & Barcode Label Printed",
        location: newOrder.location,
        operator: collector,
        details: `Requisition entered into LabFlow LIMS database by ${newOrder.doctorName}. Vacuum tube prepared.`,
        status: "active",
      },
    ],
  };

  const reportId = `RPT-${orderId.replace("ORD-", "")}`;
  const newReport: LabReport = {
    id: reportId,
    orderId: orderId,
    sampleId: sampleId,
    patient: newOrder.patient,
    tests: newOrder.tests,
    status: "Pending Review",
    reviewer: newOrder.doctorName || "Dr. Priya Sharma, MD",
    createdAt: `${newOrder.createdDate} ${newOrder.createdAt}`,
    priority: newOrder.priority,
    doctorName: newOrder.doctorName,
    sampleType: sampleType,
    location: newOrder.location,
    collector: collector,
  };

  if (!db.orders) db.orders = [];
  if (!db.samples) db.samples = [];
  if (!db.reports) db.reports = [];
  if (!db.results) db.results = [];

  const newResult = generateTestResultForOrder(newOrder);

  db.orders.unshift(newOrder);
  db.samples.unshift(newSample);
  db.reports.unshift(newReport);
  db.results.unshift(newResult);

  // Update workflow stage count
  const orderedStage = db.workflowStages.find((st) => st.key === "ORDERED");
  if (orderedStage) {
    orderedStage.count += 1;
  }

  // Increment billing test usage
  if (db.settings?.billing) {
    db.settings.billing.usedQuota += 1;
  }

  // Add audit log
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "ORDER_CREATED",
    user: newOrder.doctorName || "Physician",
    role: "Doctor",
    details: `Order ${orderId} created for patient ${newOrder.patient.name} (${newOrder.patient.mrn}) with sample ${sampleId}, report ${reportId} & test result ${newResult.id}.`,
    location: newOrder.location,
  });

  writeDatabase(db);

  return { order: newOrder, sample: newSample, report: newReport, result: newResult };
}

// SAMPLE OPERATIONS
export function getSamples(filter?: { barcode?: string; stage?: string }): LabSample[] {
  const db = readDatabase();
  let result = db.samples;
  if (filter?.barcode) {
    result = result.filter((s) => s.barcode.toLowerCase() === filter.barcode?.toLowerCase());
  }
  if (filter?.stage) {
    result = result.filter((s) => s.stage === filter.stage);
  }
  return result;
}

export function updateSampleStage(
  sampleId: string,
  newStage: LabStage,
  operator: string = "Lab Technologist",
  location?: string,
  notes?: string
): LabSample | null {
  const db = readDatabase();
  const sample = db.samples.find((s) => s.id === sampleId);
  if (!sample) return null;

  const oldStage = sample.stage;
  sample.stage = newStage;
  if (location) sample.currentLocation = location;

  if (newStage === "RELEASED") {
    sample.status = "Completed";
  } else if (newStage === "PROCESSING") {
    sample.status = "Processing";
  } else if (newStage === "REVIEW") {
    sample.status = "Processing";
  } else if (newStage === "RECEIVED") {
    sample.status = "Received";
  } else if (newStage === "IN_TRANSIT") {
    sample.status = "In Transit";
  } else if (newStage === "COLLECTED") {
    sample.status = "Collected";
  }

  sample.timeline.unshift({
    id: `tl-adv-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: new Date().toISOString().split("T")[0],
    event: `Custody Advancement: ${oldStage} → ${newStage}`,
    location: location || sample.currentLocation,
    operator,
    details: notes || `Specimen progressed to ${newStage} in chain of custody.`,
    status: "completed",
  });

  // Also reflect in matching order
  const order = db.orders.find((o) => o.id === sample.orderId);
  if (order) {
    order.currentStage = newStage;
    if (newStage === "RELEASED") {
      order.status = "Completed";
    } else if (newStage === "REVIEW") {
      order.status = "Pending Review";
    } else {
      order.status = "In Progress";
    }
  }

  // Update audit log
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "SAMPLE_STAGE_UPDATED",
    user: operator,
    role: "Technologist",
    details: `Sample ${sampleId} transitioned from ${oldStage} to ${newStage}.`,
    location: location || sample.currentLocation,
  });

  writeDatabase(db);
  return sample;
}

export function rejectSample(sampleId: string, reason: string, operator: string = "Accessioning Tech"): LabSample | null {
  const db = readDatabase();
  const sample = db.samples.find((s) => s.id === sampleId);
  if (!sample) return null;

  sample.status = "Rejected";

  sample.timeline.unshift({
    id: `tl-rej-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: new Date().toISOString().split("T")[0],
    event: "Sample Pre-Analytical Rejection",
    location: sample.currentLocation,
    operator,
    details: `REJECTED: ${reason}. Automated redraw order initiated.`,
    status: "completed",
  });

  // Trigger an alert
  db.alerts.unshift({
    id: `ALT-REJ-${Date.now()}`,
    category: "Rejected",
    title: `Sample ${sampleId} Rejected: ${reason}`,
    description: `Specimen rejected due to ${reason}. Redraw required for patient ${sample.patient.name}.`,
    timestamp: "Just now",
    entityId: sampleId,
    actionable: true,
  });

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "SAMPLE_REJECTED",
    user: operator,
    role: "Technologist",
    details: `Sample ${sampleId} rejected. Reason: ${reason}`,
    location: sample.currentLocation,
  });

  writeDatabase(db);
  return sample;
}

// TEST RESULTS OPERATIONS
export function generateTestResultForOrder(order: LabOrder): TestResult {
  const testsStr = (order.tests || []).join(" ").toLowerCase();
  let instrument = "Sysmex XN-1000 Hematology System";
  let comments = "Pathologist medical review: Parameter observations correlate with clinical requisition. Biological reference ranges validated.";
  const parameters: ResultParameter[] = [];

  if (testsStr.includes("cbc") || testsStr.includes("blood count") || testsStr.includes("hemogram")) {
    instrument = "Sysmex XN-1000 Automated Hematology";
    comments = "Hematology review: Hemoglobin, red cell mass, and thrombocyte indices are stable. Differential leukocyte count verified.";
    parameters.push(
      { name: "Hemoglobin (Hb)", result: 13.4, unit: "g/dL", referenceRange: "12.0 – 16.0", flag: "Normal", status: "Verified" },
      { name: "Total Leukocyte Count (WBC)", result: 11.2, unit: "10³/µL", referenceRange: "4.0 – 11.0", flag: "High", status: "Pending Review" },
      { name: "Platelet Count", result: 245, unit: "10³/µL", referenceRange: "150 – 450", flag: "Normal", status: "Verified" },
      { name: "Red Blood Cells (RBC)", result: 4.45, unit: "10⁶/µL", referenceRange: "4.0 – 5.2", flag: "Normal", status: "Verified" },
      { name: "Hematocrit (PCV)", result: 39.5, unit: "%", referenceRange: "36.0 – 46.0", flag: "Normal", status: "Verified" },
      { name: "Neutrophils", result: 72, unit: "%", referenceRange: "40 – 70", flag: "High", status: "Pending Review" },
      { name: "Lymphocytes", result: 22, unit: "%", referenceRange: "20 – 45", flag: "Normal", status: "Verified" },
      { name: "Monocytes", result: 4, unit: "%", referenceRange: "2 – 8", flag: "Normal", status: "Verified" },
      { name: "Eosinophils", result: 2, unit: "%", referenceRange: "1 – 6", flag: "Normal", status: "Verified" }
    );
  }

  if (testsStr.includes("lipid") || testsStr.includes("cholesterol")) {
    instrument = "Cobas 8000 c702 Clinical Chemistry";
    comments = "Lipid panel analysis: Moderate borderline hypercholesterolemia with elevated non-HDL lipid fractions. Dietary counseling advised.";
    parameters.push(
      { name: "Total Cholesterol", result: 218, unit: "mg/dL", referenceRange: "< 200", flag: "High", status: "Pending Review" },
      { name: "HDL Cholesterol (Good)", result: 44, unit: "mg/dL", referenceRange: "> 40", flag: "Normal", status: "Verified" },
      { name: "LDL Cholesterol (Calculated)", result: 138, unit: "mg/dL", referenceRange: "< 100", flag: "High", status: "Pending Review" },
      { name: "Serum Triglycerides", result: 175, unit: "mg/dL", referenceRange: "< 150", flag: "High", status: "Pending Review" },
      { name: "VLDL Cholesterol", result: 35, unit: "mg/dL", referenceRange: "10 – 30", flag: "High", status: "Pending Review" },
      { name: "Total / HDL Ratio", result: 4.95, unit: "Ratio", referenceRange: "< 4.5", flag: "High", status: "Pending Review" }
    );
  }

  if (testsStr.includes("hba1c") || testsStr.includes("glucose") || testsStr.includes("sugar")) {
    instrument = "Tosoh G8 Automated HPLC Analyzer";
    comments = "Glycated hemoglobin fraction within non-diabetic target index. Fasting plasma glucose correlates with adequate glycemic control.";
    parameters.push(
      { name: "Fasting Blood Glucose", result: 96, unit: "mg/dL", referenceRange: "70 – 99", flag: "Normal", status: "Verified" },
      { name: "Glycated Hemoglobin (HbA1c)", result: 5.6, unit: "%", referenceRange: "< 5.7", flag: "Normal", status: "Verified" },
      { name: "Estimated Average Glucose (eAG)", result: 114, unit: "mg/dL", referenceRange: "90 – 120", flag: "Normal", status: "Verified" }
    );
  }

  if (testsStr.includes("liver") || testsStr.includes("lft")) {
    instrument = "Cobas 8000 c702 Clinical Chemistry";
    comments = "Hepatic biomarker evaluation: Transaminases, bilirubin clearance, and total synthetic protein concentrations within normal limits.";
    parameters.push(
      { name: "Total Bilirubin", result: 0.85, unit: "mg/dL", referenceRange: "0.2 – 1.2", flag: "Normal", status: "Verified" },
      { name: "Direct Bilirubin", result: 0.22, unit: "mg/dL", referenceRange: "0.0 – 0.3", flag: "Normal", status: "Verified" },
      { name: "SGOT / AST", result: 28, unit: "U/L", referenceRange: "10 – 40", flag: "Normal", status: "Verified" },
      { name: "SGPT / ALT", result: 32, unit: "U/L", referenceRange: "7 – 56", flag: "Normal", status: "Verified" },
      { name: "Alkaline Phosphatase (ALP)", result: 84, unit: "U/L", referenceRange: "44 – 147", flag: "Normal", status: "Verified" },
      { name: "Total Protein", result: 7.2, unit: "g/dL", referenceRange: "6.0 – 8.3", flag: "Normal", status: "Verified" },
      { name: "Serum Albumin", result: 4.3, unit: "g/dL", referenceRange: "3.5 – 5.0", flag: "Normal", status: "Verified" }
    );
  }

  if (testsStr.includes("kidney") || testsStr.includes("kft") || testsStr.includes("renal") || testsStr.includes("electrolyte")) {
    instrument = "Beckman Coulter AU5800 Analyzer";
    comments = "Renal function profiling: Glomerular filtration capacity normal. Serum electrolytes and nitrogenous clearance adequate.";
    parameters.push(
      { name: "Serum Creatinine", result: 0.92, unit: "mg/dL", referenceRange: "0.60 – 1.20", flag: "Normal", status: "Verified" },
      { name: "Blood Urea Nitrogen (BUN)", result: 14.5, unit: "mg/dL", referenceRange: "7.0 – 20.0", flag: "Normal", status: "Verified" },
      { name: "Serum Uric Acid", result: 4.6, unit: "mg/dL", referenceRange: "3.5 – 7.2", flag: "Normal", status: "Verified" },
      { name: "Serum Sodium (Na+)", result: 140, unit: "mEq/L", referenceRange: "135 – 145", flag: "Normal", status: "Verified" },
      { name: "Serum Potassium (K+)", result: 4.2, unit: "mEq/L", referenceRange: "3.5 – 5.1", flag: "Normal", status: "Verified" },
      { name: "Serum Chloride (Cl-)", result: 101, unit: "mEq/L", referenceRange: "96 – 106", flag: "Normal", status: "Verified" }
    );
  }

  if (testsStr.includes("thyroid") || testsStr.includes("tsh") || testsStr.includes("t3") || testsStr.includes("t4")) {
    instrument = "Abbott Architect i2000SR Immunoassay";
    comments = "Thyroid function assessment: TSH level within standard therapeutic baseline. Free peripheral thyronine levels normal.";
    parameters.push(
      { name: "Total Triiodothyronine (T3)", result: 1.25, unit: "ng/mL", referenceRange: "0.80 – 2.00", flag: "Normal", status: "Verified" },
      { name: "Total Thyroxine (T4)", result: 8.4, unit: "µg/dL", referenceRange: "5.1 – 14.1", flag: "Normal", status: "Verified" },
      { name: "Thyroid Stimulating Hormone (TSH)", result: 2.15, unit: "µIU/mL", referenceRange: "0.27 – 4.20", flag: "Normal", status: "Verified" }
    );
  }

  if (testsStr.includes("d-dimer") || testsStr.includes("dimer")) {
    instrument = "Stago Compact Max Coagulation";
    comments = "Hemostasis profile: D-Dimer levels normal. Coagulation cascade and fibrin turnover within physiological limits.";
    parameters.push(
      { name: "D-Dimer Quantitative", result: 0.28, unit: "µg/mL FEU", referenceRange: "< 0.50", flag: "Normal", status: "Verified" },
      { name: "Prothrombin Time (PT)", result: 12.2, unit: "seconds", referenceRange: "11.0 – 13.5", flag: "Normal", status: "Verified" },
      { name: "INR Ratio", result: 1.04, unit: "Ratio", referenceRange: "0.85 – 1.15", flag: "Normal", status: "Verified" }
    );
  }

  if (testsStr.includes("urine")) {
    instrument = "Sysmex UN-Series Automated Urinalysis";
    comments = "Urinalysis examination: Physical and microscopic examination negative for active infection, cast formation, or nephrotic proteinuria.";
    parameters.push(
      { name: "Specific Gravity", result: "1.018", unit: "", referenceRange: "1.005 – 1.030", flag: "Normal", status: "Verified" },
      { name: "pH", result: "6.0", unit: "", referenceRange: "4.5 – 8.0", flag: "Normal", status: "Verified" },
      { name: "Urine Protein", result: "Negative", unit: "", referenceRange: "Negative", flag: "Normal", status: "Verified" },
      { name: "Urine Glucose", result: "Nil", unit: "", referenceRange: "Nil", flag: "Normal", status: "Verified" },
      { name: "Pus Cells (WBC)", result: "1–2", unit: "/ HPF", referenceRange: "0 – 5", flag: "Normal", status: "Verified" }
    );
  }

  // Fallback if no specific panel matched
  if (parameters.length === 0) {
    parameters.push(
      { name: "Hemoglobin (Hb)", result: 12.8, unit: "g/dL", referenceRange: "12.0 – 16.0", flag: "Normal", status: "Verified" },
      { name: "Total Leukocyte Count (WBC)", result: 8.4, unit: "10³/µL", referenceRange: "4.0 – 11.0", flag: "Normal", status: "Verified" },
      { name: "Platelet Count", result: 220, unit: "10³/µL", referenceRange: "150 – 450", flag: "Normal", status: "Verified" },
      { name: "Fasting Blood Glucose", result: 92, unit: "mg/dL", referenceRange: "70 – 99", flag: "Normal", status: "Verified" },
      { name: "Serum Creatinine", result: 0.88, unit: "mg/dL", referenceRange: "0.60 – 1.20", flag: "Normal", status: "Verified" }
    );
  }

  return {
    id: `RES-${order.id.replace("ORD-", "")}`,
    orderId: order.id,
    sampleId: order.sampleId,
    patient: order.patient,
    testName: order.tests && order.tests.length > 0 ? order.tests.join(", ") : "Complete Blood Count (CBC)",
    instrument,
    completedAt: order.createdAt || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    reviewer: order.doctorName || "Dr. Arvind Swaminathan, MD",
    status: order.currentStage === "RELEASED" ? "Approved" : "Pending Review",
    comments,
    parameters,
  };
}

export function getTestResults(orderId?: string): TestResult[] {
  const db = readDatabase();
  let updated = false;

  if (!db.results) {
    db.results = [];
    updated = true;
  }

  // Ensure every order in db.orders has a corresponding test result in db.results
  if (db.orders && Array.isArray(db.orders)) {
    for (const order of db.orders) {
      const existingResult = db.results.find(
        (r) => r.orderId === order.id || r.id === `RES-${order.id.replace("ORD-", "")}`
      );
      if (!existingResult) {
        const synResult = generateTestResultForOrder(order);
        db.results.push(synResult);
        updated = true;
      } else {
        // Sync patient demographics and email
        if (order.patient && (!existingResult.patient || !existingResult.patient.email)) {
          existingResult.patient = { ...existingResult.patient, ...order.patient };
          updated = true;
        }
      }
    }
  }

  if (updated) {
    writeDatabase(db);
  }

  let results = db.results && db.results.length > 0 ? db.results : [DEMO_TEST_RESULT];

  if (orderId) {
    return results.filter((r) => r.orderId === orderId);
  }
  return results;
}

export function createOrUpdateTestResult(result: TestResult): TestResult {
  const db = readDatabase();
  if (!db.results) db.results = [];
  const existingIndex = db.results.findIndex(
    (r) => r.id === result.id || (r.orderId === result.orderId && r.testName === result.testName)
  );
  if (existingIndex >= 0) {
    db.results[existingIndex] = { ...db.results[existingIndex], ...result };
  } else {
    db.results.unshift(result);
  }

  // Audit trail
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "ANALYZER_RESULT_INGESTED",
    user: result.instrument || "Auto-Analyzer LIMS Bridge",
    role: "Analyzer",
    details: `Automated test parameters ingested for order ${result.orderId} (${result.testName}) on ${result.instrument}.`,
    location: "Main Automated Laboratory",
  });

  writeDatabase(db);
  return result;
}

export function verifyTestResult(
  resultId: string,
  reviewer: string = "Dr. Arvind Swaminathan, MD",
  comments?: string
): TestResult | null {
  const db = readDatabase();
  const q = (resultId || "").trim().toLowerCase();
  let result = db.results.find(
    (r) =>
      r.id.toLowerCase() === q ||
      r.orderId.toLowerCase() === q ||
      (r.sampleId && r.sampleId.toLowerCase() === q) ||
      (r.patient?.name && r.patient.name.toLowerCase() === q)
  );
  if (!result && (resultId === "DEMO_TEST_RESULT" || !resultId)) {
    result = db.results[0];
  }

  if (!result) return null;

  result.status = "Approved";
  result.reviewer = reviewer;
  if (comments) result.comments = comments;
  if (result.parameters) {
    result.parameters = result.parameters.map((p) => ({ ...p, status: "Verified" }));
  }

  // Advance associated sample and order
  updateSampleStage(result.sampleId, "RELEASED", reviewer, "Pathology Office", "Medical sign-off complete.");

  const order = db.orders.find((o) => o.id === result?.orderId);
  if (order) {
    order.status = "Completed";
    order.currentStage = "RELEASED";
  }

  // Also update corresponding report
  const report = db.reports.find((r) => r.orderId === result?.orderId);
  if (report) {
    report.status = "Released";
    report.reviewer = reviewer;
    report.releasedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Audit
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "RESULT_VERIFIED_SIGN_OFF",
    user: reviewer,
    role: "Pathologist",
    details: `Test results for order ${result.orderId} (${result.patient?.name || "Patient"}) digitally verified and signed by pathologist.`,
    location: "Main Pathology Department",
  });

  writeDatabase(db);
  return result;
}

// REPORT OPERATIONS
export function getReports(): LabReport[] {
  const db = readDatabase();
  let updated = false;
  if (!db.reports) {
    db.reports = [];
    updated = true;
  }

  // Ensure every order in db.orders has a corresponding diagnostic report in db.reports
  if (db.orders && Array.isArray(db.orders)) {
    for (const order of db.orders) {
      const existingReport = db.reports.find((r) => r.orderId === order.id);
      const matchingSample = db.samples?.find((s) => s.orderId === order.id);
      if (!existingReport) {
        const reportId = `RPT-${order.id.replace("ORD-", "")}`;
        const synthesizedReport: LabReport = {
          id: reportId,
          orderId: order.id,
          sampleId: order.sampleId || matchingSample?.id,
          patient: order.patient,
          tests: order.tests,
          status: order.currentStage === "RELEASED" ? "Released" : order.currentStage === "REVIEW" ? "Pending Review" : "Draft",
          reviewer: order.doctorName || "Dr. Priya Sharma, MD",
          createdAt: `${order.createdDate || "2026-09-10"} ${order.createdAt || "09:00"}`,
          releasedAt: order.currentStage === "RELEASED" ? order.createdAt : undefined,
          priority: order.priority,
          doctorName: order.doctorName,
          sampleType: matchingSample?.sampleType || "Whole Blood (EDTA)",
          location: order.location,
          collector: "Sunita Verma",
        };
        db.reports.unshift(synthesizedReport);
        updated = true;
      } else {
        // Backfill any missing fields from order to report
        let reportModified = false;
        if (!existingReport.doctorName && order.doctorName) {
          existingReport.doctorName = order.doctorName;
          reportModified = true;
        }
        if (!existingReport.priority && order.priority) {
          existingReport.priority = order.priority;
          reportModified = true;
        }
        if (!existingReport.location && order.location) {
          existingReport.location = order.location;
          reportModified = true;
        }
        if (!existingReport.sampleId && (order.sampleId || matchingSample?.id)) {
          existingReport.sampleId = order.sampleId || matchingSample?.id;
          reportModified = true;
        }
        if (!existingReport.sampleType && matchingSample?.sampleType) {
          existingReport.sampleType = matchingSample.sampleType;
          reportModified = true;
        }
        if ((!existingReport.patient.phone || existingReport.patient.phone === "+91 98000 11111") && order.patient?.phone) {
          existingReport.patient.phone = order.patient.phone;
          reportModified = true;
        }
        if (reportModified) updated = true;
      }
    }
  }

  if (updated) {
    writeDatabase(db);
  }

  return db.reports;
}

export function releaseReport(reportId: string, signedBy: string = "Dr. Arvind Swaminathan, MD"): LabReport | null {
  const db = readDatabase();
  const report = db.reports.find((r) => r.id === reportId);
  if (!report) return null;

  report.status = "Released";
  report.releasedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  report.reviewer = signedBy;

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "REPORT_DIGITALLY_SIGNED",
    user: signedBy,
    role: "Pathologist",
    details: `Diagnostic report ${reportId} for ${report.patient.name} digitally attested and dispatched.`,
    location: "Main Reference Lab",
  });

  writeDatabase(db);
  return report;
}

// ALERT OPERATIONS
export function getAlerts(): AlertItem[] {
  const db = readDatabase();
  return db.alerts;
}

export function dismissAlert(alertId: string): boolean {
  const db = readDatabase();
  const idx = db.alerts.findIndex((a) => a.id === alertId);
  if (idx !== -1) {
    db.alerts.splice(idx, 1);
    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: "ALERT_ACKNOWLEDGED",
      user: "Operations Admin",
      role: "Admin",
      details: `Operational alert ${alertId} acknowledged and dismissed from queue.`,
    });
    writeDatabase(db);
    return true;
  }
  return false;
}

// SETTINGS & MONETIZATION
export function getSettings(): LabSettings {
  const db = readDatabase();
  return db.settings;
}

export function updateSettings(newSettings: Partial<LabSettings>): LabSettings {
  const db = readDatabase();
  db.settings = {
    ...db.settings,
    ...newSettings,
  };
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "SETTINGS_UPDATED",
    user: "Operations Director",
    role: "Admin",
    details: "Laboratory platform configuration and parameters updated.",
  });
  writeDatabase(db);
  return db.settings;
}

// AUDIT OPERATIONS
export function getAuditLogs() {
  const db = readDatabase();
  return db.auditLogs;
}

export function addAuditLog(entry: { action: string; user: string; role: string; details: string; location?: string }) {
  const db = readDatabase();
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...entry,
  });
  writeDatabase(db);
}

// TEAM OPERATIONS
export function getTeam(): TeamMember[] {
  const db = readDatabase();
  return db.team || INITIAL_TEAM;
}

export function createTeamMember(member: Partial<TeamMember>): TeamMember {
  const db = readDatabase();
  const newMember: TeamMember = {
    id: `tm-${Date.now()}`,
    name: member.name || "New Staff Member",
    role: member.role || "Lab Technician",
    department: member.department || "Operations",
    location: member.location || "Main Reference Lab",
    status: member.status || "Active",
    lastActive: "Just now",
    email: member.email || `staff-${Date.now()}@labflow.io`,
  };
  if (!db.team) db.team = [...INITIAL_TEAM];
  db.team.unshift(newMember);
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "STAFF_MEMBER_PROVISIONED",
    user: "Operations Director",
    role: "Admin",
    details: `Staff member ${newMember.name} (${newMember.role}) added to roster.`,
    location: newMember.location,
  });
  writeDatabase(db);
  return newMember;
}

export function updateTeamMemberStatus(id: string, status: "Active" | "On Break" | "Offline"): TeamMember | null {
  const db = readDatabase();
  if (!db.team) db.team = [...INITIAL_TEAM];
  const member = db.team.find((m) => m.id === id);
  if (!member) return null;
  member.status = status;
  member.lastActive = "Just now";
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "STAFF_STATUS_UPDATED",
    user: "Operations Director",
    role: "Admin",
    details: `Staff member ${member.name} roster status updated to ${status}.`,
    location: member.location,
  });
  writeDatabase(db);
  return member;
}

export function addTestPanel(panel: {
  code: string;
  name: string;
  loinc: string;
  dept: string;
  tat: string;
  price: string;
  status: string;
}) {
  const db = readDatabase();
  if (!db.settings.testCatalog) db.settings.testCatalog = [];
  db.settings.testCatalog.unshift(panel);
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "TEST_CATALOG_UPDATED",
    user: "Laboratory Director",
    role: "Admin",
    details: `New test panel ${panel.name} (${panel.code}) added to diagnostic catalog.`,
  });
  writeDatabase(db);
  return db.settings.testCatalog;
}

export function addCollectionCenter(center: {
  code: string;
  name: string;
  address: string;
  phone: string;
  capacity: string;
  status: string;
}) {
  const db = readDatabase();
  if (!db.settings.collectionCenters) db.settings.collectionCenters = [];
  db.settings.collectionCenters.unshift(center);
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "COLLECTION_CENTER_REGISTERED",
    user: "Operations Director",
    role: "Admin",
    details: `Specimen collection center ${center.name} (${center.code}) registered in database.`,
  });
  writeDatabase(db);
  return db.settings.collectionCenters;
}

// EMAIL DISPATCH OPERATIONS
export function logSentEmail(record: SentEmailRecord): SentEmailRecord {
  const db = readDatabase();
  if (!db.sentEmails) db.sentEmails = [];
  db.sentEmails.unshift(record);
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "REPORT_EMAILED_TO_PARENT",
    user: "Laboratory Notification Engine",
    role: "System",
    details: `Diagnostic Report ${record.reportId} for patient ${record.patientName} dispatched to parent/guardian at ${record.recipientEmail}.`,
    location: "Automated Dispatch Gateway",
  });
  writeDatabase(db);
  return record;
}

export function getSentEmails(): SentEmailRecord[] {
  const db = readDatabase();
  return db.sentEmails || [];
}

// WHATSAPP DISPATCH OPERATIONS
export function logSentWhatsApp(record: SentWhatsAppRecord): SentWhatsAppRecord {
  const db = readDatabase();
  if (!db.sentWhatsApp) db.sentWhatsApp = [];
  db.sentWhatsApp.unshift(record);
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "REPORT_WHATSAPP_DISPATCHED",
    user: "Laboratory Notification Engine",
    role: "System",
    details: `Diagnostic Report ${record.reportId} for patient ${record.patientName} dispatched via WhatsApp to ${record.recipientPhone}.`,
    location: "WhatsApp Cloud Gateway",
  });
  writeDatabase(db);
  return record;
}

export function getSentWhatsApp(): SentWhatsAppRecord[] {
  const db = readDatabase();
  return db.sentWhatsApp || [];
}

// RESILIENCE & FAILURE SIMULATION ENGINE (PHASE 3)
export function triggerFailureSimulation(scenario: string) {
  const db = readDatabase();
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toISOString().split("T")[0];

  if (scenario === "ANALYZER_MAINTENANCE") {
    // Inject Analyzer Failure Alert
    db.alerts.unshift({
      id: "ALT-SIM-ANALYZER",
      category: "Critical",
      title: "Sysmex XN-1000: Laser Sensor Drift (>2.5 SD)",
      description: "Automated optical flow cytometry sensor drift detected. Sysmex XN-1000 shifted to Maintenance mode. Reagent lot verification and 2-point optical recalibration required.",
      timestamp: "Just now",
      entityId: "SYS-XN-1000",
      actionable: true,
    });
    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: now.toISOString(),
      action: "ANALYZER_MAINTENANCE_TRIGGERED",
      user: "Auto-Analyzer QC Sentinel",
      role: "System",
      details: "Sysmex XN-1000 optical flow sensor drifted by +2.8 SD. Ingestion queue halted. Pending specimens routed to backup Sysmex workstation.",
      location: "Main Hematology Section",
    });
    writeDatabase(db);
    return {
      scenario,
      status: "ACTIVE_SIMULATION",
      alertId: "ALT-SIM-ANALYZER",
      affectedEntity: "Sysmex XN-1000",
      impact: "Workstation halted, backup routing engaged",
      recoveryAction: "Click 'Recalibrate & Restore' to run optical prime cycle.",
    };
  }

  if (scenario === "SAMPLE_REJECTION") {
    // Reject target sample
    const sample = db.samples[0] || { id: "SMP-20491", orderId: "ORD-10294", patient: { name: "Aditi Rao" } };
    sample.status = "Rejected";
    if (sample.timeline) {
      sample.timeline.unshift({
        id: `tl-sim-rej-${Date.now()}`,
        timestamp: timeStr,
        date: dateStr,
        event: "Pre-Analytical Specimen Rejection",
        location: "Accessioning Bench",
        operator: "Lead Accessioning Tech",
        details: "REJECTED: Severe in-vitro hemolysis (Hemolysis Index > 500 mg/dL). Pre-analytical tube invalid for potassium / LDH testing. Automated redraw requisition ORD-REDRAW-" + sample.id + " generated.",
        status: "completed",
      });
    }

    db.alerts.unshift({
      id: "ALT-SIM-REJ",
      category: "Rejected",
      title: `Sample ${sample.id} Rejected (Gross Hemolysis)`,
      description: `Specimen ${sample.id} rejected due to gross in-vitro hemolysis. Automated redraw requisition ORD-REDRAW-${sample.id} queued for phlebotomy.`,
      timestamp: "Just now",
      entityId: sample.id,
      actionable: true,
    });

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: now.toISOString(),
      action: "SAMPLE_REJECTED_PREANALYTICAL",
      user: "Lead Accessioning Tech",
      role: "Technologist",
      details: `Specimen ${sample.id} failed pre-analytical inspection (Hemolysis Index > 500). Redraw order ORD-REDRAW-${sample.id} created.`,
      location: "Central Accessioning Lab",
    });
    writeDatabase(db);
    return {
      scenario,
      status: "ACTIVE_SIMULATION",
      sampleId: sample.id,
      reason: "Gross in-vitro hemolysis (Index > 500 mg/dL)",
      redrawOrderId: `ORD-REDRAW-${sample.id}`,
      recoveryAction: "Click 'Dispatch Redraw' to advance redraw requisition.",
    };
  }

  if (scenario === "TAT_BREACH") {
    const targetOrder = db.orders.find((o) => o.priority !== "STAT") || db.orders[0];
    if (targetOrder) targetOrder.priority = "STAT";

    db.alerts.unshift({
      id: "ALT-SIM-TAT",
      category: "Delayed",
      title: `STAT SLA Breach: Order ${targetOrder?.id || "ORD-10293"} (${targetOrder?.patient?.name || "Rahul Kumar"})`,
      description: `Turnaround time exceeded by 28 mins (Target SLA: 45m, Elapsed: 73m). Priority auto-escalated to STAT OVERDUE. Expedited bench routing active.`,
      timestamp: "Just now",
      entityId: targetOrder?.id || "ORD-10293",
      actionable: true,
    });

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: now.toISOString(),
      action: "TAT_SLA_BREACH_ESCALATED",
      user: "SLA Monitoring Daemon",
      role: "System",
      details: `Order ${targetOrder?.id || "ORD-10293"} breached 45m SLA. Escalated to STAT priority. Notified attending physician.`,
      location: "Automated Dispatch Sentinel",
    });
    writeDatabase(db);
    return {
      scenario,
      status: "ACTIVE_SIMULATION",
      orderId: targetOrder?.id || "ORD-10293",
      elapsedTime: "73m",
      slaTarget: "45m",
      recoveryAction: "Click 'Expedite & Clear Breach' to restore normal queue priority.",
    };
  }

  if (scenario === "DUPLICATE_ORDER") {
    db.alerts.unshift({
      id: "ALT-SIM-DUP",
      category: "Information",
      title: "Duplicate Order Blocked (Idempotency Key: IDEMP-84920)",
      description: "Duplicate requisition for Aditi Rao (CBC panel) submitted within 5-minute debounce window. Intercepted by Idempotency Middleware. Duplicate billing and redraw prevented.",
      timestamp: "Just now",
      entityId: "IDEMP-84920",
      actionable: false,
    });

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: now.toISOString(),
      action: "DUPLICATE_REQUISITION_BLOCKED",
      user: "Idempotency Middleware",
      role: "System",
      details: "Blocked duplicate order for Aditi Rao with identical test payload within 5m window. Idempotency Key: IDEMP-ORD-10294-f89a.",
      location: "API Ingestion Gateway",
    });
    writeDatabase(db);
    return {
      scenario,
      status: "INTERCEPTED",
      idempotencyKey: "IDEMP-ORD-10294-f89a",
      httpStatus: 409,
      protection: "Zero duplicate charges and zero duplicate tube draws created.",
    };
  }

  if (scenario === "INVALID_TRANSITION") {
    db.alerts.unshift({
      id: "ALT-SIM-INV",
      category: "Critical",
      title: "Security: Illegal State Transition Intercepted",
      description: "Attempted illegal transition ORDERED → RELEASED on un-accessioned specimen. Blocked by State Machine Integrity Guard (Rule: specimen must complete RECEIVED → PROCESSING → REVIEW before release).",
      timestamp: "Just now",
      entityId: "STATE-GUARD-01",
      actionable: false,
    });

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: now.toISOString(),
      action: "STATE_MACHINE_INVARIANT_VIOLATION",
      user: "LIMS Security Sentinel",
      role: "System",
      details: "Illegal state transition attempt ORDERED -> RELEASED intercepted. Enforced mandatory clinical chain-of-custody path.",
      location: "Core State Machine Engine",
    });
    writeDatabase(db);
    return {
      scenario,
      status: "INTERCEPTED",
      violation: "ORDERED → RELEASED (Bypassed Accessioning & Testing)",
      enforcedPath: "ORDERED → COLLECTED → IN_TRANSIT → RECEIVED → PROCESSING → REVIEW → RELEASED",
    };
  }

  if (scenario === "DELIVERY_FAILURE") {
    const failedJob: SentEmailRecord = {
      id: `JOB-DLQ-${Date.now()}`,
      reportId: "RPT-10290",
      recipientEmail: "suresh.menon@gmail.com",
      recipientName: "Suresh Menon",
      patientName: "Suresh Menon",
      subject: "Official Diagnostic Report RPT-10290",
      timestamp: timeStr,
      status: "Failed",
      messageId: `msg-fail-${Date.now()}`,
      notes: "SMTP 421 4.7.0 Connection timeout: mx.google.com. Placed into Dead-Letter Queue (DLQ). Exponential backoff scheduled (Attempt 1/3).",
    };
    if (!db.sentEmails) db.sentEmails = [];
    db.sentEmails.unshift(failedJob);

    db.alerts.unshift({
      id: "ALT-SIM-DLQ",
      category: "Critical",
      title: "Email Delivery Failure: Report RPT-10290",
      description: "SMTP connection timeout to suresh.menon@gmail.com. Job moved to Dead-Letter Queue (DLQ). Auto-retry scheduled with 2s exponential backoff.",
      timestamp: "Just now",
      entityId: failedJob.id,
      actionable: true,
    });

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: now.toISOString(),
      action: "DELIVERY_FAILED_MOVED_TO_DLQ",
      user: "Notification Worker Pool",
      role: "System",
      details: `Delivery of report RPT-10290 to suresh.menon@gmail.com failed with timeout. Moved to Dead-Letter Queue (job ID: ${failedJob.id}).`,
      location: "Asynchronous Queue Dispatcher",
    });
    writeDatabase(db);
    return {
      scenario,
      status: "QUEUED_IN_DLQ",
      jobId: failedJob.id,
      recipient: failedJob.recipientEmail,
      dlqPolicy: "Max Retries: 3 | Exponential Backoff: 2s, 4s, 8s",
      recoveryAction: "Click 'Retry Dead-Letter Job' in Message Queues tab to re-dispatch.",
    };
  }

  return { scenario, status: "UNKNOWN" };
}

export function recoverFailureSimulation(scenario: string) {
  const db = readDatabase();
  const now = new Date();

  // Remove matching simulation alerts
  if (scenario === "ANALYZER_MAINTENANCE") {
    db.alerts = db.alerts.filter((a) => a.id !== "ALT-SIM-ANALYZER");
    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: now.toISOString(),
      action: "ANALYZER_RECALIBRATION_RECOVERED",
      user: "Dr. Arvind Swaminathan, MD",
      role: "Pathologist",
      details: "Sysmex XN-1000 optical sensors recalibrated across 2 points. Sensor drift normalized to +0.2 SD. Analyzer restored to RUNNING status.",
      location: "Main Hematology Section",
    });
  } else if (scenario === "SAMPLE_REJECTION") {
    db.alerts = db.alerts.filter((a) => a.id !== "ALT-SIM-REJ");
    // Restore sample status or mark redraw scheduled
    if (db.samples[0] && db.samples[0].status === "Rejected") {
      db.samples[0].status = "In Progress";
    }
    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: now.toISOString(),
      action: "REDRAW_REQUISITION_DISPATCHED",
      user: "Sunita Verma",
      role: "Collection Staff",
      details: "Automated redraw requisition dispatched to outpatient phlebotomist. Redraw tube barcode printed.",
      location: "Central Phlebotomy Hub",
    });
  } else if (scenario === "TAT_BREACH") {
    db.alerts = db.alerts.filter((a) => a.id !== "ALT-SIM-TAT");
    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: now.toISOString(),
      action: "TAT_SLA_BREACH_RESOLVED",
      user: "Lab Operations Supervisor",
      role: "Admin",
      details: "Specimen processing completed and verified. Turnaround-time breach alert closed.",
      location: "Operations Desk",
    });
  } else if (scenario === "DELIVERY_FAILURE") {
    db.alerts = db.alerts.filter((a) => a.id !== "ALT-SIM-DLQ");
    if (db.sentEmails) {
      const failed = db.sentEmails.find((e) => e.status === "Failed");
      if (failed) {
        failed.status = "Delivered";
        failed.notes = "Re-dispatched successfully from Dead-Letter Queue on retry attempt 2.";
      }
    }
    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: now.toISOString(),
      action: "DLQ_JOB_RETRY_SUCCESSFUL",
      user: "Asynchronous Queue Worker",
      role: "System",
      details: "Dead-letter queue job successfully delivered on retry attempt 2. SMTP 250 OK acknowledged.",
      location: "Asynchronous Dispatcher",
    });
  } else {
    // Clear any generic simulation alert
    db.alerts = db.alerts.filter((a) => !a.id.startsWith("ALT-SIM-"));
  }

  writeDatabase(db);
  return { success: true, scenario, message: `Scenario ${scenario} recovered successfully. System restored to nominal state.` };
}

export function retryMessageJob(jobId: string) {
  const db = readDatabase();
  const now = new Date();
  let found = false;

  if (db.sentEmails) {
    const job = db.sentEmails.find((e) => e.id === jobId || e.id.includes(jobId));
    if (job) {
      job.status = "Delivered";
      job.notes = "Successfully re-dispatched from Dead-Letter Queue (DLQ) on retry attempt 2. SMTP 250 OK.";
      found = true;
    }
  }

  if (!found && db.sentWhatsApp) {
    const job = db.sentWhatsApp.find((w) => w.id === jobId || w.id.includes(jobId));
    if (job) {
      job.status = "Delivered";
      job.notes = "Successfully delivered via WhatsApp Cloud Gateway retry.";
      found = true;
    }
  }

  // Also clear any matching DLQ alert
  db.alerts = (db.alerts || []).filter((a) => a.entityId !== jobId && a.id !== "ALT-SIM-DLQ");

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: now.toISOString(),
    action: "DLQ_JOB_MANUAL_RETRY",
    user: "Queue Operations Engineer",
    role: "Admin",
    details: `Dead-letter queue job ${jobId} manually re-triggered. Delivered successfully with verified acknowledgment.`,
    location: "Message Queue Telemetry Engine",
  });

  writeDatabase(db);
  return { success: true, jobId, message: `Job ${jobId} successfully re-dispatched and marked Delivered.` };
}

export function flushAllQueues() {
  const db = readDatabase();
  const now = new Date();
  let count = 0;

  if (db.sentEmails) {
    db.sentEmails.forEach((e) => {
      if (e.status !== "Delivered") {
        e.status = "Delivered";
        e.notes = "Processed & delivered during bulk queue flush.";
        count++;
      }
    });
  }

  if (db.sentWhatsApp) {
    db.sentWhatsApp.forEach((w) => {
      if (w.status !== "Delivered") {
        w.status = "Delivered";
        w.notes = "Delivered during bulk queue flush.";
        count++;
      }
    });
  }

  // Clear DLQ alerts
  db.alerts = (db.alerts || []).filter((a) => a.id !== "ALT-SIM-DLQ");

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: now.toISOString(),
    action: "ASYNC_QUEUES_BULK_FLUSH",
    user: "Queue Operations Engineer",
    role: "Admin",
    details: `Flushed all pending/failed async jobs (${count} jobs). All workers processed to 0 backlog.`,
    location: "BullMQ / Redis Queue Engine",
  });

  writeDatabase(db);
  return { success: true, count, message: `Successfully processed and delivered ${count} pending queue jobs.` };
}

export function dispatchSimulatedQueueJob(channel: "EMAIL" | "WHATSAPP", recipient?: string) {
  const db = readDatabase();
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (channel === "EMAIL") {
    const emailJob: SentEmailRecord = {
      id: `eml-sim-${Date.now()}`,
      reportId: "RPT-10294",
      recipientEmail: recipient || "aditi.rao@apexhealth.com",
      recipientName: "Aditi Rao",
      patientName: "Aditi Rao",
      subject: "Diagnostic Laboratory Report Released: Aditi Rao (RPT-10294)",
      timestamp: timeStr,
      status: "Delivered",
      messageId: `MSG-SIM-${Date.now()}`,
      notes: "Enqueued into BullMQ email-dispatch-queue. Delivered via SendGrid SMTP pool (ACK 250 OK).",
    };
    if (!db.sentEmails) db.sentEmails = [];
    db.sentEmails.unshift(emailJob);
    writeDatabase(db);
    return emailJob;
  } else {
    const waJob: SentWhatsAppRecord = {
      id: `wa-sim-${Date.now()}`,
      reportId: "RPT-10294",
      recipientPhone: recipient || "+91 98765 43210",
      recipientName: "Aditi Rao",
      patientName: "Aditi Rao",
      message: "Your official diagnostic report RPT-10294 is ready for download.",
      timestamp: timeStr,
      status: "Delivered",
      messageId: `MSG-WA-${Date.now()}`,
      notes: "Enqueued into BullMQ whatsapp-notify-queue. Meta WhatsApp Cloud API delivered acknowledgment received.",
    };
    if (!db.sentWhatsApp) db.sentWhatsApp = [];
    db.sentWhatsApp.unshift(waJob);
    writeDatabase(db);
    return waJob;
  }
// PATIENT OPERATIONS
export function getPatients(query?: string, page: number = 1, limit: number = 20): { patients: PatientRecord[]; total: number; page: number; limit: number } {
  const db = readDatabase();
  const patientMap = new Map<string, PatientRecord>();

  // Aggregate patients stored in db.patients
  if (db.patients && Array.isArray(db.patients)) {
    for (const p of db.patients) {
      patientMap.set(p.id, { ...p, orderCount: 0, latestActivity: p.latestActivity || "Registered" });
    }
  }

  // Aggregate patients from orders
  if (db.orders && Array.isArray(db.orders)) {
    for (const ord of db.orders) {
      if (!ord.patient) continue;
      const pid = ord.patient.id || ord.patient.mrn;
      const existing = patientMap.get(pid);
      if (existing) {
        existing.orderCount = (existing.orderCount || 0) + 1;
        existing.latestActivity = `Order ${ord.id} (${ord.status})`;
      } else {
        patientMap.set(pid, {
          id: ord.patient.id || `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
          name: ord.patient.name,
          age: ord.patient.age,
          gender: ord.patient.gender,
          phone: ord.patient.phone,
          email: `${ord.patient.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
          mrn: ord.patient.mrn,
          orderCount: 1,
          latestActivity: `Order ${ord.id} (${ord.status})`,
          createdAt: ord.createdDate,
        });
      }
    }
  }

  let list = Array.from(patientMap.values());

  if (query) {
    const q = query.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        p.id.toLowerCase().includes(q)
    );
  }

  const total = list.length;
  const startIndex = (page - 1) * limit;
  const paginated = list.slice(startIndex, startIndex + limit);

  return { patients: paginated, total, page, limit };
}

export function getPatientById(id: string): PatientRecord | null {
  const { patients } = getPatients();
  const found = patients.find((p) => p.id === id || p.mrn === id);
  return found || null;
}

export function getPatientOrders(id: string): LabOrder[] {
  const db = readDatabase();
  return db.orders.filter((o) => o.patient.id === id || o.patient.mrn === id);
}

export function createPatient(patientData: Partial<PatientRecord>): PatientRecord {
  const db = readDatabase();
  if (!db.patients) db.patients = [];

  const newPatient: PatientRecord = {
    id: patientData.id || `PAT-${Date.now().toString().slice(-4)}`,
    name: patientData.name || "Unnamed Patient",
    age: patientData.age || 35,
    gender: patientData.gender || "Other",
    phone: patientData.phone || "+91 90000 00000",
    email: patientData.email || `${(patientData.name || "patient").toLowerCase().replace(/\s+/g, ".")}@example.com`,
    mrn: patientData.mrn || `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
    address: patientData.address || "Main City District",
    allergies: patientData.allergies || [],
    vitals: patientData.vitals || { bp: "120/80", hr: 72, spo2: "98%", temp: "98.6°F" },
    activeMeds: patientData.activeMeds || [],
    createdAt: new Date().toISOString().split("T")[0],
    orderCount: 0,
    latestActivity: "Patient registered in database",
  };

  db.patients.unshift(newPatient);
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "PATIENT_REGISTERED",
    user: "Registration Desk",
    role: "Intake",
    details: `Patient ${newPatient.name} (${newPatient.mrn}) registered in database.`,
  });

  writeDatabase(db);
  return newPatient;
}

// DASHBOARD SUMMARY & CHARTS
export function getDashboardSummary() {
  const db = readDatabase();
  const orders = db.orders || [];
  const samples = db.samples || [];
  const { total: totalPatients } = getPatients();

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.currentStage !== "RELEASED" && o.status !== "Completed").length;
  const processingOrders = orders.filter((o) => o.currentStage === "PROCESSING" || o.currentStage === "RECEIVED").length;
  const completedOrders = orders.filter((o) => o.currentStage === "RELEASED" || o.status === "Completed").length;
  const urgentOrders = orders.filter((o) => o.priority === "STAT" || o.priority === "Urgent").length;
  const overdueOrders = orders.filter((o) => o.status === "Delayed" || o.tat.includes("overdue")).length;

  const ordersByStatus: Record<string, number> = {
    ORDERED: orders.filter((o) => o.currentStage === "ORDERED").length,
    COLLECTED: orders.filter((o) => o.currentStage === "COLLECTED").length,
    IN_TRANSIT: orders.filter((o) => o.currentStage === "IN_TRANSIT").length,
    RECEIVED: orders.filter((o) => o.currentStage === "RECEIVED").length,
    PROCESSING: orders.filter((o) => o.currentStage === "PROCESSING").length,
    REVIEW: orders.filter((o) => o.currentStage === "REVIEW").length,
    RELEASED: orders.filter((o) => o.currentStage === "RELEASED").length,
  };

  const ordersByPriority: Record<string, number> = {
    Normal: orders.filter((o) => o.priority === "Normal").length,
    Urgent: orders.filter((o) => o.priority === "Urgent").length,
    STAT: orders.filter((o) => o.priority === "STAT").length,
  };

  // Group daily orders
  const dailyOrdersMap = new Map<string, number>();
  for (const o of orders) {
    const d = o.createdDate || "2026-09-10";
    dailyOrdersMap.set(d, (dailyOrdersMap.get(d) || 0) + 1);
  }
  const dailyOrders = Array.from(dailyOrdersMap.entries()).map(([date, count]) => ({ date, count }));

  // Test distribution
  const testDistMap = new Map<string, number>();
  for (const o of orders) {
    for (const t of o.tests) {
      testDistMap.set(t, (testDistMap.get(t) || 0) + 1);
    }
  }
  const testDistribution = Array.from(testDistMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    summary: {
      totalPatients,
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      urgentOrders,
      overdueOrders,
      averageTat: "45m",
    },
    charts: {
      ordersByStatus,
      ordersByPriority,
      dailyOrders,
      testDistribution,
    },
    recentOrders: orders.slice(0, 10),
    workflowStages: db.workflowStages,
    exceptions: db.exceptions,
  };
}

// TEST CATALOG MANAGEMENT
export function getTestCatalog() {
  const db = readDatabase();
  return db.settings?.testCatalog || [];
}

export function updateTestCatalogItem(code: string, updated: Partial<{ name: string; loinc: string; dept: string; tat: string; price: string; status: string }>) {
  const db = readDatabase();
  if (!db.settings.testCatalog) db.settings.testCatalog = [];
  const idx = db.settings.testCatalog.findIndex((t) => t.code.toUpperCase() === code.toUpperCase());
  if (idx !== -1) {
    db.settings.testCatalog[idx] = { ...db.settings.testCatalog[idx], ...updated };
    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: "TEST_CATALOG_UPDATED",
      user: "Lab Manager",
      role: "Admin",
      details: `Test panel ${code} updated in diagnostic menu.`,
    });
    writeDatabase(db);
    return db.settings.testCatalog[idx];
  }
  return null;
}

export function deleteTestCatalogItem(code: string) {
  const db = readDatabase();
  if (!db.settings.testCatalog) return false;
  const idx = db.settings.testCatalog.findIndex((t) => t.code.toUpperCase() === code.toUpperCase());
  if (idx !== -1) {
    db.settings.testCatalog.splice(idx, 1);
    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: "TEST_CATALOG_DELETED",
      user: "Lab Manager",
      role: "Admin",
      details: `Test panel ${code} removed from catalog.`,
    });
    writeDatabase(db);
    return true;
  }
  return false;
}

// LOOKUP UTILITIES
export function getOrderById(id: string): LabOrder | null {
  const db = readDatabase();
  return db.orders.find((o) => o.id === id) || null;
}

export function getOrderTimeline(id: string) {
  const db = readDatabase();
  const sample = db.samples.find((s) => s.orderId === id);
  if (sample && sample.timeline) {
    return sample.timeline;
  }
  const order = db.orders.find((o) => o.id === id);
  if (!order) return [];
  return [
    {
      id: `tl-${order.id}`,
      timestamp: order.createdAt,
      date: order.createdDate,
      event: "Requisition Registered in Database",
      location: order.location,
      operator: order.doctorName,
      details: `Order created for ${order.patient.name} (${order.tests.join(", ")}).`,
      status: "active",
    },
  ];
}

export function getSampleById(id: string): LabSample | null {
  const db = readDatabase();
  return db.samples.find((s) => s.id === id) || null;
}

// GLOBAL SEARCH
export function globalSearch(query: string) {
  const db = readDatabase();
  const q = query.toLowerCase().trim();
  if (!q) return { patients: [], orders: [], samples: [], reports: [], tests: [] };

  const { patients: allPatients } = getPatients(q);
  const matchedPatients = allPatients.slice(0, 5);

  const matchedOrders = db.orders
    .filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.patient.name.toLowerCase().includes(q) ||
        o.patient.mrn.toLowerCase().includes(q) ||
        o.tests.some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, 5);

  const matchedSamples = db.samples
    .filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.barcode.toLowerCase().includes(q) ||
        s.patient.name.toLowerCase().includes(q) ||
        s.test.toLowerCase().includes(q)
    )
    .slice(0, 5);

  const matchedReports = db.reports
    .filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.patient.name.toLowerCase().includes(q) ||
        r.reviewer.toLowerCase().includes(q) ||
        r.tests.some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, 5);

  const matchedTests = (db.settings.testCatalog || [])
    .filter((t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || t.loinc.toLowerCase().includes(q))
    .slice(0, 5);

  return {
    patients: matchedPatients,
    orders: matchedOrders,
    samples: matchedSamples,
    reports: matchedReports,
    tests: matchedTests,
  };
}



