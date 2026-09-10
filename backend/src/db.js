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
  if (!db.results) db.results = [];

  const newResult = generateTestResultForOrder(newOrder);

  db.orders.unshift(newOrder);
  db.samples.unshift(newSample);
  db.reports.unshift(newReport);
  db.results.unshift(newResult);

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
function generateTestResultForOrder(order) {
  const testsStr = (order.tests || []).join(" ").toLowerCase();
  let instrument = "Sysmex XN-1000 Hematology System";
  let comments = "Pathologist medical review: Parameter observations correlate with clinical requisition. Biological reference ranges validated.";
  const parameters = [];

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
  } else if (testsStr.includes("lipid") || testsStr.includes("cholesterol")) {
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
  } else if (testsStr.includes("hba1c") || testsStr.includes("glucose") || testsStr.includes("sugar")) {
    instrument = "Tosoh G8 Automated HPLC Analyzer";
    comments = "Glycated hemoglobin fraction within non-diabetic target index. Fasting plasma glucose correlates with adequate glycemic control.";
    parameters.push(
      { name: "Fasting Blood Glucose", result: 96, unit: "mg/dL", referenceRange: "70 – 99", flag: "Normal", status: "Verified" },
      { name: "Glycated Hemoglobin (HbA1c)", result: 5.6, unit: "%", referenceRange: "< 5.7", flag: "Normal", status: "Verified" },
      { name: "Estimated Average Glucose (eAG)", result: 114, unit: "mg/dL", referenceRange: "90 – 120", flag: "Normal", status: "Verified" }
    );
  } else if (testsStr.includes("liver") || testsStr.includes("lft")) {
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
  } else if (testsStr.includes("kidney") || testsStr.includes("kft") || testsStr.includes("renal") || testsStr.includes("electrolyte")) {
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
  } else if (testsStr.includes("thyroid") || testsStr.includes("tsh") || testsStr.includes("t3") || testsStr.includes("t4")) {
    instrument = "Abbott Architect i2000SR Immunoassay";
    comments = "Thyroid function assessment: TSH level within standard therapeutic baseline. Free peripheral thyronine levels normal.";
    parameters.push(
      { name: "Total Triiodothyronine (T3)", result: 1.25, unit: "ng/mL", referenceRange: "0.80 – 2.00", flag: "Normal", status: "Verified" },
      { name: "Total Thyroxine (T4)", result: 8.4, unit: "µg/dL", referenceRange: "5.1 – 14.1", flag: "Normal", status: "Verified" },
      { name: "Thyroid Stimulating Hormone (TSH)", result: 2.15, unit: "µIU/mL", referenceRange: "0.27 – 4.20", flag: "Normal", status: "Verified" }
    );
  } else {
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
    parameters
  };
}

function getTestResults(orderId) {
  const db = readDatabase();
  let updated = false;

  if (!db.results) {
    db.results = [];
    updated = true;
  }

  if (db.orders && Array.isArray(db.orders)) {
    for (const order of db.orders) {
      const existing = (db.results || []).find(r => r.orderId === order.id || r.id === `RES-${order.id.replace("ORD-", "")}`);
      if (!existing) {
        db.results.push(generateTestResultForOrder(order));
        updated = true;
      } else if (order.patient && (!existing.patient || !existing.patient.email)) {
        existing.patient = { ...existing.patient, ...order.patient };
        updated = true;
      }
    }
  }

  if (updated) {
    writeDatabase(db);
  }

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
  const q = (resultId || "").trim().toLowerCase();
  let result = (db.results || []).find(
    r =>
      r.id.toLowerCase() === q ||
      r.orderId.toLowerCase() === q ||
      (r.sampleId && r.sampleId.toLowerCase() === q) ||
      (r.patient && r.patient.name && r.patient.name.toLowerCase() === q)
  );
  if (!result && (resultId === "DEMO_TEST_RESULT" || !resultId)) {
    result = db.results && db.results[0];
  }
  if (!result) return null;

  result.status = "Approved";
  result.reviewer = reviewer;
  if (comments) result.comments = comments;
  if (result.parameters) {
    result.parameters = result.parameters.map(p => ({ ...p, status: "Verified" }));
  }

  updateSampleStage(result.sampleId, "RELEASED", reviewer, "Pathology Office", "Medical sign-off complete.");

  const order = (db.orders || []).find(o => o.id === result.orderId);
  if (order) {
    order.status = "Completed";
    order.currentStage = "RELEASED";
  }

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
