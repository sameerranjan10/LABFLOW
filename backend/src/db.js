const fs = require("fs");
const path = require("path");

const DB_FILE_PATH = path.join(__dirname, "..", "data", "labflow_db.json");

function readDatabase() {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      console.warn("[Backend DB] Database file not found at " + DB_FILE_PATH + ", creating initial structure.");
      return {
        orders: [],
        samples: [],
        alerts: [],
        reports: [],
        exceptions: [],
        workflowStages: [],
        results: [],
        team: [],
        sentEmails: [],
        settings: {
          organization: { name: "Apex Diagnostics", license: "NABL-2026", address: "Main Hub", email: "ops@apex.com" },
          billing: { plan: "professional", usedQuota: 3840, maxQuota: 5000, renewsAt: "2026-10-01" },
          testCatalog: [],
          collectionCenters: []
        },
        auditLogs: [],
        version: "3.0.0-backend",
        lastUpdated: new Date().toISOString()
      };
    }
    const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.sentEmails) parsed.sentEmails = [];
    if (!parsed.auditLogs) parsed.auditLogs = [];
    return parsed;
  } catch (err) {
    console.error("[Backend DB] Read error:", err);
    return { orders: [], samples: [], reports: [], alerts: [], results: [], team: [], sentEmails: [], auditLogs: [] };
  }
}

function writeDatabase(db) {
  try {
    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[Backend DB] Write error:", err);
    return false;
  }
}

// ORDERS
function getOrders(query = {}) {
  const db = readDatabase();
  let orders = db.orders || [];
  if (query.stage) {
    orders = orders.filter(o => o.currentStage === query.stage);
  }
  if (query.priority) {
    orders = orders.filter(o => o.priority && o.priority.toLowerCase() === query.priority.toLowerCase());
  }
  return orders;
}

function createOrder(orderData) {
  const db = readDatabase();
  const orderId = orderData.id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
  const sampleId = orderData.sampleId || `SMP-${Math.floor(20000 + Math.random() * 80000)}`;

  const newOrder = {
    id: orderId,
    sampleId: sampleId,
    patient: orderData.patient || {
      id: `PAT-${Date.now().toString().slice(-4)}`,
      name: "Anonymous Patient",
      age: 40,
      gender: "Male",
      phone: "+91 98765 43210",
      mrn: `MRN-${Math.floor(100000 + Math.random() * 900000)}`
    },
    tests: orderData.tests && orderData.tests.length > 0 ? orderData.tests : ["Complete Blood Count (CBC)"],
    priority: orderData.priority || "Normal",
    currentStage: "ORDERED",
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    createdDate: new Date().toISOString().split("T")[0],
    tat: "15m",
    status: "In Progress",
    location: orderData.location || "Main Reference Lab (Central)",
    doctorName: orderData.doctorName || "Dr. Priya Sharma, MD"
  };

  const sampleType = orderData.sampleType || "Whole Blood (EDTA)";
  const collector = orderData.collector || "Sunita Verma";

  const newSample = {
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
        details: `Requisition entered into LabFlow LIMS backend by ${newOrder.doctorName}. Vacuum tube prepared.`,
        status: "active"
      }
    ]
  };

  const reportId = `RPT-${orderId.replace("ORD-", "")}`;
  const newReport = {
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
    collector: collector
  };

  if (!db.orders) db.orders = [];
  if (!db.samples) db.samples = [];
  if (!db.reports) db.reports = [];

  db.orders.unshift(newOrder);
  db.samples.unshift(newSample);
  db.reports.unshift(newReport);

  if (db.workflowStages) {
    const st = db.workflowStages.find(s => s.key === "ORDERED");
    if (st) st.count = (st.count || 0) + 1;
  }

  if (db.settings && db.settings.billing) {
    db.settings.billing.usedQuota = (db.settings.billing.usedQuota || 0) + 1;
  }

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "ORDER_CREATED",
    user: newOrder.doctorName || "Physician",
    role: "Doctor",
    details: `Order ${orderId} created for patient ${newOrder.patient.name} with sample ${sampleId} & report ${reportId}.`,
    location: newOrder.location
  });

  writeDatabase(db);
  return { order: newOrder, sample: newSample, report: newReport };
}

// SAMPLES
function getSamples(query = {}) {
  const db = readDatabase();
  let samples = db.samples || [];
  if (query.barcode) {
    samples = samples.filter(s => s.barcode && s.barcode.toLowerCase() === query.barcode.toLowerCase());
  }
  if (query.stage) {
    samples = samples.filter(s => s.stage === query.stage);
  }
  return samples;
}

function updateSampleStage(sampleId, newStage, operator = "Lab Technologist", location, notes) {
  const db = readDatabase();
  const sample = (db.samples || []).find(s => s.id === sampleId);
  if (!sample) return null;

  const oldStage = sample.stage;
  sample.stage = newStage;
  if (location) sample.currentLocation = location;

  if (newStage === "RELEASED") sample.status = "Completed";
  else if (newStage === "REVIEW" || newStage === "PROCESSING") sample.status = "Processing";
  else if (newStage === "RECEIVED") sample.status = "Received";
  else if (newStage === "IN_TRANSIT") sample.status = "In Transit";
  else if (newStage === "COLLECTED") sample.status = "Collected";

  if (!sample.timeline) sample.timeline = [];
  sample.timeline.unshift({
    id: `tl-adv-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: new Date().toISOString().split("T")[0],
    event: `Custody Advancement: ${oldStage} → ${newStage}`,
    location: location || sample.currentLocation,
    operator,
    details: notes || `Specimen progressed to ${newStage} in chain of custody.`,
    status: "completed"
  });

  const order = (db.orders || []).find(o => o.id === sample.orderId);
  if (order) {
    order.currentStage = newStage;
    order.status = newStage === "RELEASED" ? "Completed" : newStage === "REVIEW" ? "Pending Review" : "In Progress";
  }

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "SAMPLE_STAGE_UPDATED",
    user: operator,
    role: "Technologist",
    details: `Sample ${sampleId} transitioned from ${oldStage} to ${newStage}.`,
    location: location || sample.currentLocation
  });

  writeDatabase(db);
  return sample;
}

function rejectSample(sampleId, reason = "Specimen Hemolyzed", operator = "Accessioning Tech") {
  const db = readDatabase();
  const sample = (db.samples || []).find(s => s.id === sampleId);
  if (!sample) return null;

  sample.status = "Rejected";
  if (!sample.timeline) sample.timeline = [];
  sample.timeline.unshift({
    id: `tl-rej-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: new Date().toISOString().split("T")[0],
    event: "Sample Pre-Analytical Rejection",
    location: sample.currentLocation,
    operator,
    details: `REJECTED: ${reason}. Automated redraw order initiated.`,
    status: "completed"
  });

  if (!db.alerts) db.alerts = [];
  db.alerts.unshift({
    id: `ALT-REJ-${Date.now()}`,
    category: "Rejected",
    title: `Sample ${sampleId} Rejected: ${reason}`,
    description: `Specimen rejected due to ${reason}. Redraw required for patient ${sample.patient ? sample.patient.name : 'Unknown'}.`,
    timestamp: "Just now",
    entityId: sampleId,
    actionable: true
  });

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "SAMPLE_REJECTED",
    user: operator,
    role: "Technologist",
    details: `Sample ${sampleId} rejected. Reason: ${reason}`,
    location: sample.currentLocation
  });

  writeDatabase(db);
  return sample;
}

// TEST RESULTS
function getTestResults(orderId) {
  const db = readDatabase();
  if (orderId) {
    return (db.results || []).filter(r => r.orderId === orderId);
  }
  return db.results || [];
}

function createOrUpdateTestResult(result) {
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
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "ANALYZER_RESULT_INGESTED",
    user: result.instrument || "Auto-Analyzer LIMS Bridge",
    role: "Analyzer",
    details: `Automated test parameters ingested for order ${result.orderId} (${result.testName}) on ${result.instrument}.`,
    location: "Main Automated Laboratory"
  });
  writeDatabase(db);
  return result;
}

function verifyTestResult(resultId, reviewer = "Dr. Arvind Swaminathan, MD", comments) {
  const db = readDatabase();
  let result = (db.results || []).find(r => r.id === resultId) || (db.results && db.results[0]);
  if (!result) return null;

  result.status = "Approved";
  result.reviewer = reviewer;
  if (comments) result.comments = comments;
  if (result.parameters) {
    result.parameters = result.parameters.map(p => ({ ...p, status: "Verified" }));
  }

  updateSampleStage(result.sampleId, "RELEASED", reviewer, "Pathology Office", "Medical sign-off complete.");

  const report = (db.reports || []).find(r => r.orderId === result.orderId);
  if (report) {
    report.status = "Released";
    report.reviewer = reviewer;
    report.releasedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "RESULT_VERIFIED_SIGN_OFF",
    user: reviewer,
    role: "Pathologist",
    details: `Test results for order ${result.orderId} digitally verified and signed by pathologist.`,
    location: "Main Pathology Department"
  });

  writeDatabase(db);
  return result;
}

// REPORTS
function getReports() {
  const db = readDatabase();
  let updated = false;
  if (!db.reports) {
    db.reports = [];
    updated = true;
  }

  if (db.orders && Array.isArray(db.orders)) {
    for (const order of db.orders) {
      const existingReport = db.reports.find((r) => r.orderId === order.id);
      const matchingSample = (db.samples || []).find((s) => s.orderId === order.id);
      if (!existingReport) {
        const reportId = `RPT-${order.id.replace("ORD-", "")}`;
        const synthesizedReport = {
          id: reportId,
          orderId: order.id,
          sampleId: order.sampleId || (matchingSample ? matchingSample.id : undefined),
          patient: order.patient,
          tests: order.tests,
          status: order.currentStage === "RELEASED" ? "Released" : order.currentStage === "REVIEW" ? "Pending Review" : "Draft",
          reviewer: order.doctorName || "Dr. Priya Sharma, MD",
          createdAt: `${order.createdDate || "2026-09-10"} ${order.createdAt || "09:00"}`,
          releasedAt: order.currentStage === "RELEASED" ? order.createdAt : undefined,
          priority: order.priority,
          doctorName: order.doctorName,
          sampleType: matchingSample ? matchingSample.sampleType : "Whole Blood (EDTA)",
          location: order.location,
          collector: "Sunita Verma"
        };
        db.reports.unshift(synthesizedReport);
        updated = true;
      } else {
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
        if (!existingReport.sampleId && (order.sampleId || (matchingSample ? matchingSample.id : null))) {
          existingReport.sampleId = order.sampleId || matchingSample.id;
          reportModified = true;
        }
        if (!existingReport.sampleType && matchingSample && matchingSample.sampleType) {
          existingReport.sampleType = matchingSample.sampleType;
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

function releaseReport(reportId, signedBy = "Dr. Arvind Swaminathan, MD") {
  const db = readDatabase();
  const report = (db.reports || []).find(r => r.id === reportId);
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
    details: `Diagnostic report ${reportId} for ${report.patient ? report.patient.name : 'patient'} digitally attested and dispatched.`,
    location: "Main Reference Lab"
  });

  writeDatabase(db);
  return report;
}

// EMAIL DISPATCH (PARENT EMAIL TO niteshnemalpuri17@gmail.com)
function logSentEmail(record) {
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
    location: "Automated Dispatch Gateway"
  });

  writeDatabase(db);
  return record;
}

function getSentEmails() {
  const db = readDatabase();
  return db.sentEmails || [];
}

// ALERTS
function getAlerts() {
  const db = readDatabase();
  return db.alerts || [];
}

function dismissAlert(alertId) {
  const db = readDatabase();
  const idx = (db.alerts || []).findIndex(a => a.id === alertId);
  if (idx !== -1) {
    db.alerts.splice(idx, 1);
    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: "ALERT_ACKNOWLEDGED",
      user: "Operations Admin",
      role: "Admin",
      details: `Operational alert ${alertId} acknowledged and dismissed from queue.`
    });
    writeDatabase(db);
    return true;
  }
  return false;
}

// TEAM
function getTeam() {
  const db = readDatabase();
  return db.team || [];
}

function createTeamMember(memberData) {
  const db = readDatabase();
  const newMember = {
    id: `tm-${Date.now()}`,
    name: memberData.name || "New Staff Member",
    role: memberData.role || "Lab Technician",
    department: memberData.department || "Operations",
    location: memberData.location || "Main Reference Lab",
    status: memberData.status || "Active",
    lastActive: "Just now",
    email: memberData.email || `staff-${Date.now()}@labflow.io`
  };
  if (!db.team) db.team = [];
  db.team.unshift(newMember);

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "STAFF_MEMBER_PROVISIONED",
    user: "Operations Director",
    role: "Admin",
    details: `Staff member ${newMember.name} (${newMember.role}) added to roster.`,
    location: newMember.location
  });

  writeDatabase(db);
  return newMember;
}

function updateTeamMemberStatus(id, status) {
  const db = readDatabase();
  const member = (db.team || []).find(m => m.id === id);
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
    location: member.location
  });

  writeDatabase(db);
  return member;
}

// SETTINGS
function getSettings() {
  const db = readDatabase();
  return db.settings || {};
}

function updateSettings(newSettings) {
  const db = readDatabase();
  db.settings = { ...(db.settings || {}), ...newSettings };

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "SETTINGS_UPDATED",
    user: "Operations Director",
    role: "Admin",
    details: "Laboratory platform configuration and parameters updated."
  });

  writeDatabase(db);
  return db.settings;
}

// AUDIT
function getAuditLogs() {
  const db = readDatabase();
  return db.auditLogs || [];
}

// EMAIL DISPATCH OPERATIONS
function logSentEmail(record) {
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

function getSentEmails() {
  const db = readDatabase();
  return db.sentEmails || [];
}

// WHATSAPP DISPATCH OPERATIONS
function logSentWhatsApp(record) {
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

function getSentWhatsApp() {
  const db = readDatabase();
  return db.sentWhatsApp || [];
}

module.exports = {
  readDatabase,
  writeDatabase,
  getOrders,
  createOrder,
  getSamples,
  updateSampleStage,
  rejectSample,
  getTestResults,
  createOrUpdateTestResult,
  verifyTestResult,
  getReports,
  releaseReport,
  logSentEmail,
  getSentEmails,
  logSentWhatsApp,
  getSentWhatsApp,
  getAlerts,
  dismissAlert,
  getTeam,
  createTeamMember,
  updateTeamMemberStatus,
  getSettings,
  updateSettings,
  getAuditLogs,
  DB_FILE_PATH
};
