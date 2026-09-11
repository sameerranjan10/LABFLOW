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
  status: "Delivered" | "Sent" | "Pending";
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
} {
  const db = readDatabase();

  const orderId = order.id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
  const sampleId = order.sampleId || `SMP-${Math.floor(20000 + Math.random() * 80000)}`;
  const sampleType = order.sampleType || "Whole Blood (EDTA)";
  const collector = order.collector || "Sunita Verma";

  const newOrder: LabOrder = {
    id: orderId,
    sampleId: sampleId,
    patient: order.patient || {
      id: `PAT-${Date.now().toString().slice(-4)}`,
      name: "Anonymous Patient",
      age: 40,
      gender: "Male",
      phone: "+91 98765 43210",
      mrn: `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
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

  db.orders.unshift(newOrder);
  db.samples.unshift(newSample);
  db.reports.unshift(newReport);

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
    details: `Order ${orderId} created for patient ${newOrder.patient.name} (${newOrder.patient.mrn}) with sample ${sampleId} & report ${reportId}.`,
    location: newOrder.location,
  });

  writeDatabase(db);

  return { order: newOrder, sample: newSample, report: newReport };
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
export function getTestResults(orderId?: string): TestResult[] {
  const db = readDatabase();
  let results = db.results && db.results.length > 0 ? db.results : [DEMO_TEST_RESULT];

  results = results.map((r: any) => {
    if (!r.patient) {
      r.patient = {
        id: r.patientId || "P-84920",
        name: r.patientName || "Aditi Rao",
        age: r.age || 47,
        gender: r.gender || "Female",
        phone: r.phone || "+91 98765 43210",
        mrn: r.mrn || "MRN-84920",
      };
    }
    if (!r.instrument) r.instrument = "Sysmex XN-1000 (Serial #SX-9941)";
    if (!r.completedAt) r.completedAt = "11:15 AM";
    return r as TestResult;
  });

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
  let result = db.results.find((r) => r.id === resultId);
  if (!result) {
    result = db.results[0]; // default demo result if id matches general
  }

  result.status = "Approved";
  result.reviewer = reviewer;
  if (comments) result.comments = comments;
  result.parameters = result.parameters.map((p) => ({ ...p, status: "Verified" }));

  // Advance associated sample and order
  updateSampleStage(result.sampleId, "RELEASED", reviewer, "Pathology Office", "Medical sign-off complete.");

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
    details: `Test results for order ${result.orderId} digitally verified and signed by pathologist.`,
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



