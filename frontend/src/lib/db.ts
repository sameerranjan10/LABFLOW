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

export interface LabDatabase {
  orders: LabOrder[];
  samples: LabSample[];
  alerts: AlertItem[];
  reports: LabReport[];
  exceptions: ExceptionItem[];
  workflowStages: WorkflowStageMetric[];
  results: TestResult[];
  team: TeamMember[];
  sentEmails: SentEmailRecord[];
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

export function createOrder(order: Partial<LabOrder>): { order: LabOrder; sample: LabSample } {
  const db = readDatabase();

  const orderId = order.id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
  const sampleId = order.sampleId || `SMP-${Math.floor(20000 + Math.random() * 80000)}`;

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
    sampleType: "Whole Blood (EDTA)",
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
        operator: "Accessioning Clerk",
        details: "Requisition entered into LabFlow LIMS database. Vacuum tube prepared.",
        status: "active",
      },
    ],
  };

  db.orders.unshift(newOrder);
  db.samples.unshift(newSample);

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
    details: `Order ${orderId} created for patient ${newOrder.patient.name} (${newOrder.patient.mrn}) with sample ${sampleId}.`,
    location: newOrder.location,
  });

  writeDatabase(db);

  return { order: newOrder, sample: newSample };
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
  if (orderId) {
    return db.results.filter((r) => r.orderId === orderId);
  }
  return db.results;
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


