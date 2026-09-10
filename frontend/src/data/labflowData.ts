export interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  mrn: string;
  email?: string;
}

export type OrderPriority = "STAT" | "Urgent" | "Normal";

export type LabStage =
  | "ORDERED"
  | "COLLECTED"
  | "IN_TRANSIT"
  | "RECEIVED"
  | "PROCESSING"
  | "REVIEW"
  | "RELEASED";

export interface LabOrder {
  id: string; // e.g. ORD-10294
  sampleId: string; // e.g. SMP-20491
  patient: PatientData;
  tests: string[]; // e.g. ["CBC", "Glucose"]
  priority: OrderPriority;
  currentStage: LabStage;
  createdAt: string; // e.g. "09:42"
  createdDate: string; // e.g. "2026-09-10"
  tat: string; // e.g. "1h 12m"
  status: "In Progress" | "Pending Review" | "Completed" | "Delayed" | "Action Required";
  location: string;
  doctorName?: string;
  sampleType?: string;
  collector?: string;
  scheduledTime?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string; // "09:42"
  date: string; // "2026-09-10"
  event: string; // "Sample Collected"
  location: string; // "Reception Desk"
  operator: string; // "Sunita V. (Collector)"
  details?: string;
  status: "completed" | "active" | "pending";
}

export interface LabSample {
  id: string; // SMP-20491
  orderId: string; // ORD-10294
  patient: PatientData;
  sampleType: string; // "Whole Blood (EDTA)", "Serum", "Plasma", "Urine"
  test: string; // "CBC", "Lipid Profile", "HbA1c"
  currentLocation: string; // "Hematology Lab", "Central Transport", "Reception"
  stage: LabStage;
  collectedAt: string; // "09:42"
  tat: string; // "1h 18m"
  status: "Collected" | "In Transit" | "Received" | "Processing" | "Completed" | "Rejected" | "In Progress";
  barcode: string;
  volume: string; // "3.0 mL"
  timeline: TimelineEvent[];
}

export interface ExceptionItem {
  id: string;
  severity: "Critical" | "Warning";
  entity: "Sample" | "Order" | "Result";
  entityId: string; // e.g. SMP-20491
  test: string; // CBC
  stage: LabStage;
  issue: string; // "Analyzer failure", "Delayed pickup"
  age: string; // "18m"
  assignedTo: string; // "Riya"
  actionText: string; // "Review", "Track", "View"
}

export interface WorkflowStageMetric {
  key: LabStage;
  label: string;
  count: number;
  avgTime: string;
  delayedCount?: number;
}

export interface ResultParameter {
  name: string; // "Hemoglobin"
  result: number | string; // 12.4
  unit: string; // "g/dL"
  referenceRange: string; // "12–16"
  flag: "Normal" | "High" | "Low" | "Critical";
  status: "Verified" | "Pending Review";
}

export interface TestResult {
  id: string;
  orderId: string;
  sampleId: string;
  patient: PatientData;
  testName: string;
  instrument: string;
  completedAt: string;
  reviewer?: string;
  status: "Pending Review" | "Approved" | "Recheck Requested";
  comments?: string;
  parameters: ResultParameter[];
}

export interface LabReport {
  id: string; // RPT-4029
  orderId: string;
  patient: PatientData;
  tests: string[];
  status: "Draft" | "Pending Review" | "Approved" | "Released";
  reviewer: string;
  createdAt: string;
  releasedAt?: string;
  priority?: OrderPriority;
  doctorName?: string;
  sampleType?: string;
  location?: string;
  sampleId?: string;
  collector?: string;
  scheduledTime?: string;
}

export interface AlertItem {
  id: string;
  category: "Critical" | "Delayed" | "Rejected" | "Pending Review" | "Information";
  title: string;
  description: string;
  timestamp: string;
  entityId: string;
  actionable: boolean;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  location: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: "Lab Manager" | "Reception" | "Sample Collector" | "Lab Technician" | "Reviewer" | "Operations Admin";
  department: string;
  location: string;
  status: "Active" | "On Break" | "Offline";
  lastActive: string;
  email: string;
}

// ----------------------------------------------------
// INITIAL DEMO DATA
// ----------------------------------------------------

export const INITIAL_ORDERS: LabOrder[] = [
  {
    id: "ORD-10294",
    sampleId: "SMP-20491",
    patient: { id: "P-84920", name: "Aditi Rao", age: 47, gender: "Female", phone: "+91 98765 43210", mrn: "MRN-84920" },
    tests: ["CBC (Complete Blood Count)", "Random Glucose"],
    priority: "Urgent",
    currentStage: "PROCESSING",
    createdAt: "09:42",
    createdDate: "2026-09-10",
    tat: "1h 12m",
    status: "In Progress",
    location: "Main Laboratory - Hematology",
    doctorName: "Dr. V. Sharma",
  },
  {
    id: "ORD-10293",
    sampleId: "SMP-20490",
    patient: { id: "P-67104", name: "Rahul Kumar", age: 68, gender: "Male", phone: "+91 98123 45678", mrn: "MRN-67104" },
    tests: ["Lipid Profile", "HbA1c"],
    priority: "Normal",
    currentStage: "REVIEW",
    createdAt: "09:28",
    createdDate: "2026-09-10",
    tat: "2h 04m",
    status: "Pending Review",
    location: "Main Laboratory - Biochemistry",
    doctorName: "Dr. A. Mehta",
  },
  {
    id: "ORD-10292",
    sampleId: "SMP-20489",
    patient: { id: "P-55219", name: "Ramesh Gupta", age: 63, gender: "Male", phone: "+91 99887 76655", mrn: "MRN-55219" },
    tests: ["Liver Function Test (LFT)", "Kidney Function Test (KFT)"],
    priority: "STAT",
    currentStage: "RELEASED",
    createdAt: "08:15",
    createdDate: "2026-09-10",
    tat: "1h 45m",
    status: "Completed",
    location: "Emergency Lab",
    doctorName: "Dr. S. Kulkarni",
  },
  {
    id: "ORD-10291",
    sampleId: "SMP-20482",
    patient: { id: "P-44102", name: "Priya Nair", age: 34, gender: "Female", phone: "+91 97654 32109", mrn: "MRN-44102" },
    tests: ["Thyroid Profile (T3, T4, TSH)"],
    priority: "Normal",
    currentStage: "COLLECTED",
    createdAt: "10:05",
    createdDate: "2026-09-10",
    tat: "42m",
    status: "In Progress",
    location: "Collection Center B",
    doctorName: "Dr. R. Joshi",
  },
  {
    id: "ORD-10290",
    sampleId: "SMP-20480",
    patient: { id: "P-33912", name: "Suresh Menon", age: 52, gender: "Male", phone: "+91 98989 12345", mrn: "MRN-33912" },
    tests: ["Urine Routine & Microscopy"],
    priority: "Urgent",
    currentStage: "IN_TRANSIT",
    createdAt: "10:18",
    createdDate: "2026-09-10",
    tat: "25m",
    status: "In Progress",
    location: "North Satellite Clinic",
    doctorName: "Dr. M. Patel",
  },
  {
    id: "ORD-10289",
    sampleId: "SMP-20476",
    patient: { id: "P-22819", name: "Kavita Shah", age: 29, gender: "Female", phone: "+91 91234 56789", mrn: "MRN-22819" },
    tests: ["D-Dimer", "Serum Electrolytes"],
    priority: "STAT",
    currentStage: "RECEIVED",
    createdAt: "10:30",
    createdDate: "2026-09-10",
    tat: "15m",
    status: "In Progress",
    location: "Main Laboratory - Reception",
    doctorName: "Dr. V. Sharma",
  },
];

export const INITIAL_SAMPLES: LabSample[] = [
  {
    id: "SMP-20491",
    orderId: "ORD-10294",
    patient: { id: "P-84920", name: "Aditi Rao", age: 47, gender: "Female", phone: "+91 98765 43210", mrn: "MRN-84920" },
    sampleType: "Whole Blood (EDTA)",
    test: "CBC (Complete Blood Count)",
    currentLocation: "Hematology Lab - Sysmex XN-1000",
    stage: "PROCESSING",
    collectedAt: "09:42",
    tat: "1h 18m",
    status: "Processing",
    barcode: "LBF-84920-A",
    volume: "3.0 mL",
    timeline: [
      { id: "tl-1", timestamp: "09:42", date: "2026-09-10", event: "Sample Collected", location: "Reception Desk", operator: "Sunita V. (Sample Collector)", details: "Vacutainer EDTA 3mL filled", status: "completed" },
      { id: "tl-2", timestamp: "09:51", date: "2026-09-10", event: "Label Generated & Barcoded", location: "Collection Center", operator: "Sunita V.", details: "Barcode LBF-84920-A printed and verified", status: "completed" },
      { id: "tl-3", timestamp: "10:12", date: "2026-09-10", event: "Sample Dispatched", location: "Transport Logistics", operator: "Rajesh K. (Transport)", details: "Pneumatic Tube / Cooler Temp 4.2°C", status: "completed" },
      { id: "tl-4", timestamp: "10:46", date: "2026-09-10", event: "Received at Laboratory", location: "Main Lab Accessioning", operator: "Riya Sharma (Lab Tech)", details: "Sample integrity verified, logged into LIMS", status: "completed" },
      { id: "tl-5", timestamp: "11:02", date: "2026-09-10", event: "Processing Started", location: "Hematology Workstation #2", operator: "Amit Kumar (Technician)", details: "Loaded onto Sysmex XN-1000 Auto-analyzer", status: "active" },
    ],
  },
  {
    id: "SMP-20490",
    orderId: "ORD-10293",
    patient: { id: "P-67104", name: "Rahul Kumar", age: 68, gender: "Male", phone: "+91 98123 45678", mrn: "MRN-67104" },
    sampleType: "Serum (SST Tube)",
    test: "Lipid Profile & HbA1c",
    currentLocation: "Biochemistry Review Bench",
    stage: "REVIEW",
    collectedAt: "09:28",
    tat: "2h 04m",
    status: "Processing",
    barcode: "LBF-67104-B",
    volume: "5.0 mL",
    timeline: [
      { id: "tl-10", timestamp: "09:28", date: "2026-09-10", event: "Sample Collected", location: "Fasting Phlebotomy Room 3", operator: "Pooja N.", status: "completed" },
      { id: "tl-11", timestamp: "09:35", date: "2026-09-10", event: "Centrifuged", location: "Pre-analytical Station", operator: "Riya Sharma", details: "3500 RPM for 10 mins", status: "completed" },
      { id: "tl-12", timestamp: "10:00", date: "2026-09-10", event: "Analysis Completed", location: "Roche Cobas c501", operator: "Sysmex Automator", status: "completed" },
      { id: "tl-13", timestamp: "10:30", date: "2026-09-10", event: "Results Pending Medical Review", location: "Biochemistry Bench", operator: "Dr. A. Mehta", status: "active" },
    ],
  },
  {
    id: "SMP-20482",
    orderId: "ORD-10291",
    patient: { id: "P-44102", name: "Priya Nair", age: 34, gender: "Female", phone: "+91 97654 32109", mrn: "MRN-44102" },
    sampleType: "Serum",
    test: "Thyroid Profile (T3, T4, TSH)",
    currentLocation: "Collection Center B",
    stage: "COLLECTED",
    collectedAt: "10:05",
    tat: "42m",
    status: "Collected",
    barcode: "LBF-44102-C",
    volume: "4.0 mL",
    timeline: [
      { id: "tl-20", timestamp: "10:05", date: "2026-09-10", event: "Sample Collected", location: "Collection Center B", operator: "Sunita V.", status: "active" },
    ],
  },
  {
    id: "SMP-20480",
    orderId: "ORD-10290",
    patient: { id: "P-33912", name: "Suresh Menon", age: 52, gender: "Male", phone: "+91 98989 12345", mrn: "MRN-33912" },
    sampleType: "Sterile Urine",
    test: "Urine Routine & Microscopy",
    currentLocation: "Transit Van #4",
    stage: "IN_TRANSIT",
    collectedAt: "10:18",
    tat: "25m",
    status: "In Transit",
    barcode: "LBF-33912-D",
    volume: "20.0 mL",
    timeline: [
      { id: "tl-30", timestamp: "10:18", date: "2026-09-10", event: "Sample Collected", location: "North Satellite Clinic", operator: "Anil K.", status: "completed" },
      { id: "tl-31", timestamp: "10:25", date: "2026-09-10", event: "In Transit to Main Lab", location: "Logistics Route #4", operator: "Courier Driver", status: "active" },
    ],
  },
];

export const INITIAL_EXCEPTIONS: ExceptionItem[] = [
  {
    id: "exc-1",
    severity: "Critical",
    entity: "Sample",
    entityId: "SMP-20491",
    test: "CBC",
    stage: "PROCESSING",
    issue: "Analyzer failure on Line #2 (Sysmex XN-1000 rerun required)",
    age: "18m",
    assignedTo: "Riya Sharma",
    actionText: "Review",
  },
  {
    id: "exc-2",
    severity: "Warning",
    entity: "Sample",
    entityId: "SMP-20482",
    test: "HbA1c",
    stage: "IN_TRANSIT",
    issue: "Courier pickup delayed by 15 mins (Temperature stable 5.1°C)",
    age: "42m",
    assignedTo: "Amit Kumar",
    actionText: "Track",
  },
  {
    id: "exc-3",
    severity: "Warning",
    entity: "Order",
    entityId: "ORD-10291",
    test: "Lipid Profile",
    stage: "COLLECTED",
    issue: "Collection pending - 12h fasting verification required",
    age: "1h",
    assignedTo: "Reception Desk",
    actionText: "View",
  },
  {
    id: "exc-4",
    severity: "Critical",
    entity: "Result",
    entityId: "RES-9942",
    test: "Troponin I",
    stage: "REVIEW",
    issue: "Critical value 2.4 ng/mL exceeds panic threshold (>0.04 ng/mL)",
    age: "8m",
    assignedTo: "Dr. A. Mehta",
    actionText: "Verify",
  },
];

export const INITIAL_WORKFLOW_STAGES: WorkflowStageMetric[] = [
  { key: "ORDERED", label: "ORDERED", count: 24, avgTime: "12m" },
  { key: "COLLECTED", label: "COLLECTED", count: 18, avgTime: "18m" },
  { key: "IN_TRANSIT", label: "IN TRANSIT", count: 9, avgTime: "32m", delayedCount: 1 },
  { key: "RECEIVED", label: "RECEIVED", count: 31, avgTime: "10m" },
  { key: "PROCESSING", label: "PROCESSING", count: 42, avgTime: "45m", delayedCount: 2 },
  { key: "REVIEW", label: "REVIEW", count: 17, avgTime: "16m", delayedCount: 1 },
  { key: "RELEASED", label: "RELEASED", count: 84, avgTime: "2h 18m" },
];

export const DEMO_TEST_RESULT: TestResult = {
  id: "RES-10294",
  orderId: "ORD-10294",
  sampleId: "SMP-20491",
  patient: { id: "P-84920", name: "Aditi Rao", age: 47, gender: "Female", phone: "+91 98765 43210", mrn: "MRN-84920" },
  testName: "CBC (Complete Blood Count)",
  instrument: "Sysmex XN-1000 (Serial #SX-9941)",
  completedAt: "11:15 AM",
  reviewer: "Dr. A. Mehta (Lead Pathologist)",
  status: "Pending Review",
  comments: "WBC slightly elevated. Platelet and RBC counts within reference limits.",
  parameters: [
    { name: "Hemoglobin", result: 12.4, unit: "g/dL", referenceRange: "12.0 – 16.0", flag: "Normal", status: "Verified" },
    { name: "WBC (White Blood Cells)", result: 12.8, unit: "10³/µL", referenceRange: "4.0 – 11.0", flag: "High", status: "Pending Review" },
    { name: "Platelets", result: 210, unit: "10³/µL", referenceRange: "150 – 450", flag: "Normal", status: "Verified" },
    { name: "RBC (Red Blood Cells)", result: 4.25, unit: "10⁶/µL", referenceRange: "4.0 – 5.2", flag: "Normal", status: "Verified" },
    { name: "Hematocrit (PCV)", result: 38.2, unit: "%", referenceRange: "36.0 – 46.0", flag: "Normal", status: "Verified" },
    { name: "Neutrophils", result: 74, unit: "%", referenceRange: "40 – 70", flag: "High", status: "Pending Review" },
    { name: "Lymphocytes", result: 20, unit: "%", referenceRange: "20 – 45", flag: "Normal", status: "Verified" },
  ],
};

export const INITIAL_REPORTS: LabReport[] = [
  {
    id: "RPT-4029",
    orderId: "ORD-10292",
    patient: { id: "P-55219", name: "Ramesh Gupta", age: 63, gender: "Male", phone: "+91 99887 76655", mrn: "MRN-55219" },
    tests: ["Liver Function Test (LFT)", "Kidney Function Test (KFT)"],
    status: "Released",
    reviewer: "Dr. S. Kulkarni",
    createdAt: "09:50 AM",
    releasedAt: "10:15 AM",
    priority: "STAT",
    doctorName: "Dr. S. Kulkarni",
    sampleType: "Serum (SST Tube)",
    location: "Emergency Lab",
    sampleId: "SMP-20489",
    collector: "Sunita V.",
  },
  {
    id: "RPT-4028",
    orderId: "ORD-10293",
    patient: { id: "P-67104", name: "Rahul Kumar", age: 68, gender: "Male", phone: "+91 98123 45678", mrn: "MRN-67104" },
    tests: ["Lipid Profile", "HbA1c"],
    status: "Pending Review",
    reviewer: "Dr. A. Mehta",
    createdAt: "10:30 AM",
    priority: "Urgent",
    doctorName: "Dr. A. Mehta",
    sampleType: "Serum (SST Tube)",
    location: "Main Laboratory - Biochemistry",
    sampleId: "SMP-20490",
    collector: "Pooja N.",
  },
  {
    id: "RPT-4027",
    orderId: "ORD-10288",
    patient: { id: "P-11204", name: "Meera Sen", age: 41, gender: "Female", phone: "+91 94455 66778", mrn: "MRN-11204" },
    tests: ["Thyroid Panel"],
    status: "Approved",
    reviewer: "Dr. V. Sharma",
    createdAt: "08:45 AM",
    priority: "Normal",
    doctorName: "Dr. V. Sharma",
    sampleType: "Serum (SST Tube)",
    location: "Main Laboratory - Biochemistry",
    sampleId: "SMP-20475",
    collector: "Sunita V.",
  },
  {
    id: "RPT-4026",
    orderId: "ORD-10287",
    patient: { id: "P-77612", name: "Vikram Das", age: 55, gender: "Male", phone: "+91 93322 11009", mrn: "MRN-77612" },
    tests: ["Vitamin D3", "Vitamin B12"],
    status: "Draft",
    reviewer: "Dr. A. Mehta",
    createdAt: "11:00 AM",
    priority: "Normal",
    doctorName: "Dr. A. Mehta",
    sampleType: "Serum (SST Tube)",
    location: "Main Reference Lab",
    sampleId: "SMP-20470",
    collector: "Pooja N.",
  },
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "alt-1",
    category: "Critical",
    title: "Processing TAT Exceeded",
    description: "Sample SMP-20491 exceeded maximum processing TAT by 18 minutes due to Line #2 calibration.",
    timestamp: "11:05 AM",
    entityId: "SMP-20491",
    actionable: true,
  },
  {
    id: "alt-2",
    category: "Delayed",
    title: "Transport Courier Delayed",
    description: "Transport Van #4 for SMP-20482 delayed in traffic. Specimen cold chain maintained at 4.2°C.",
    timestamp: "10:45 AM",
    entityId: "SMP-20482",
    actionable: true,
  },
  {
    id: "alt-3",
    category: "Rejected",
    title: "Sample Rejection - Insufficient Volume",
    description: "Sample SMP-20476 (Microbiology Culture) rejected due to insufficient specimen volume (<0.5 mL).",
    timestamp: "10:15 AM",
    entityId: "SMP-20476",
    actionable: true,
  },
  {
    id: "alt-4",
    category: "Pending Review",
    title: "17 Results Awaiting Review",
    description: "17 test results (including 3 STAT urgent orders) are currently queued for Pathologist verification.",
    timestamp: "11:20 AM",
    entityId: "RES-QUEUE",
    actionable: true,
  },
  {
    id: "alt-5",
    category: "Information",
    title: "Daily Calibration Completed",
    description: "Sysmex XN-1000 and Roche Cobas c501 daily QC calibration passed successfully.",
    timestamp: "07:30 AM",
    entityId: "SYS-QC",
    actionable: false,
  },
];

export const INITIAL_TEAM: TeamMember[] = [
  { id: "tm-1", name: "Riya Sharma", role: "Lab Manager", department: "Operations", location: "Main Laboratory", status: "Active", lastActive: "Just now", email: "riya.sharma@labflow.io" },
  { id: "tm-2", name: "Amit Kumar", role: "Lab Technician", department: "Hematology", location: "Main Laboratory", status: "Active", lastActive: "5m ago", email: "amit.k@labflow.io" },
  { id: "tm-3", name: "Sunita Verma", role: "Sample Collector", department: "Phlebotomy", location: "Collection Center A", status: "Active", lastActive: "2m ago", email: "sunita.v@labflow.io" },
  { id: "tm-4", name: "Dr. Abhinav Mehta", role: "Reviewer", department: "Pathology", location: "Main Laboratory", status: "Active", lastActive: "12m ago", email: "dr.mehta@labflow.io" },
  { id: "tm-5", name: "Rajesh K.", role: "Sample Collector", department: "Transport Logistics", location: "Route #4", status: "On Break", lastActive: "25m ago", email: "rajesh.logistics@labflow.io" },
  { id: "tm-6", name: "Pooja Nambiar", role: "Reception", department: "Accessioning", location: "Front Desk", status: "Active", lastActive: "Just now", email: "pooja.n@labflow.io" },
];

export const INITIAL_AUDIT_LOGS: AuditRecord[] = [
  { id: "aud-101", timestamp: "11:02 AM", user: "Amit Kumar", role: "Lab Technician", action: "Started Processing", entity: "Sample", entityId: "SMP-20491", location: "Hematology Lab" },
  { id: "aud-100", timestamp: "10:46 AM", user: "Riya Sharma", role: "Lab Manager", action: "Received Sample", entity: "Sample", entityId: "SMP-20491", location: "Main Lab Accessioning" },
  { id: "aud-099", timestamp: "10:12 AM", user: "Rajesh K.", role: "Transport Driver", action: "Dispatched Sample Container", entity: "Transport Box", entityId: "BOX-84920", location: "Collection Center B" },
  { id: "aud-098", timestamp: "09:51 AM", user: "Sunita Verma", role: "Sample Collector", action: "Generated Barcode Label", entity: "Sample", entityId: "SMP-20491", location: "Phlebotomy Desk" },
  { id: "aud-097", timestamp: "09:42 AM", user: "Pooja Nambiar", role: "Receptionist", action: "Created Test Order", entity: "Order", entityId: "ORD-10294", location: "Front Desk" },
];
