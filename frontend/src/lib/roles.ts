/**
 * Role-Based Access Control (RBAC) System for LabFlow Enterprise (Phase 2)
 * Supports 6 distinct laboratory personas:
 * 1. Administrator - Full operations, system settings, billing, org management
 * 2. Doctor - Clinical ordering, patient chart access, review & release
 * 3. Pathologist - Medical validation, microscopic review, critical panic sign-off
 * 4. Lab Technician - Instrument workbench, analyzer ingestion, QC tracking
 * 5. Collection Staff - Phlebotomy intake, specimen accessioning, dispatch & custody log
 * 6. Patient - Consumer portal, view published reports, test history, ABDM consent
 */

export type LabRole =
  | "administrator"
  | "doctor"
  | "pathologist"
  | "lab_technician"
  | "collection_staff"
  | "patient";

export interface LabUser {
  id: string;
  name: string;
  email: string;
  role: LabRole;
  title: string;
  badge: string;
  department: string;
  location: string;
  avatarInitials: string;
  licenseNumber?: string;
  abdmHealthId?: string;
}

export interface RolePermissions {
  canViewDashboard: boolean;
  canCreateOrders: boolean;
  canCollectSamples: boolean;
  canProcessSamples: boolean;
  canReviewResults: boolean;
  canReleaseReports: boolean;
  canManageSettings: boolean;
  canViewAuditTrail: boolean;
  canViewMonetization: boolean;
  canViewAllReports: boolean;
  canViewOwnReports: boolean;
}

export const LAB_ROLES_PERMISSIONS: Record<LabRole, RolePermissions> = {
  administrator: {
    canViewDashboard: true,
    canCreateOrders: true,
    canCollectSamples: true,
    canProcessSamples: true,
    canReviewResults: true,
    canReleaseReports: true,
    canManageSettings: true,
    canViewAuditTrail: true,
    canViewMonetization: true,
    canViewAllReports: true,
    canViewOwnReports: true,
  },
  doctor: {
    canViewDashboard: true,
    canCreateOrders: true,
    canCollectSamples: false,
    canProcessSamples: false,
    canReviewResults: true,
    canReleaseReports: true,
    canManageSettings: false,
    canViewAuditTrail: true,
    canViewMonetization: false,
    canViewAllReports: true,
    canViewOwnReports: false,
  },
  pathologist: {
    canViewDashboard: true,
    canCreateOrders: false,
    canCollectSamples: false,
    canProcessSamples: false,
    canReviewResults: true,
    canReleaseReports: true,
    canManageSettings: false,
    canViewAuditTrail: true,
    canViewMonetization: false,
    canViewAllReports: true,
    canViewOwnReports: false,
  },
  lab_technician: {
    canViewDashboard: true,
    canCreateOrders: false,
    canCollectSamples: false,
    canProcessSamples: true,
    canReviewResults: false,
    canReleaseReports: false,
    canManageSettings: false,
    canViewAuditTrail: false,
    canViewMonetization: false,
    canViewAllReports: false,
    canViewOwnReports: false,
  },
  collection_staff: {
    canViewDashboard: true,
    canCreateOrders: true,
    canCollectSamples: true,
    canProcessSamples: false,
    canReviewResults: false,
    canReleaseReports: false,
    canManageSettings: false,
    canViewAuditTrail: false,
    canViewMonetization: false,
    canViewAllReports: false,
    canViewOwnReports: false,
  },
  patient: {
    canViewDashboard: false,
    canCreateOrders: false,
    canCollectSamples: false,
    canProcessSamples: false,
    canReviewResults: false,
    canReleaseReports: false,
    canManageSettings: false,
    canViewAuditTrail: false,
    canViewMonetization: false,
    canViewAllReports: false,
    canViewOwnReports: true,
  },
};

export const PRESET_LAB_USERS: Record<LabRole, LabUser> = {
  administrator: {
    id: "usr-admin-01",
    name: "Dr. Vikram Malhotra",
    email: "admin@apexdiagnostics.com",
    role: "administrator",
    title: "Laboratory Director & Operations Admin",
    badge: "Admin",
    department: "Executive Management & Quality",
    location: "Main Reference Lab (HQ)",
    avatarInitials: "VM",
    licenseNumber: "DIR-MED-9948",
  },
  doctor: {
    id: "usr-doc-01",
    name: "Dr. Priya Sharma, MD",
    email: "priya.sharma@apexdiagnostics.com",
    role: "doctor",
    title: "Consultant Physician & Ordering Clinician",
    badge: "Doctor (MD)",
    department: "Internal Medicine / Emergency",
    location: "Hospital Wing B",
    avatarInitials: "PS",
    licenseNumber: "MCI-2018-77341",
  },
  pathologist: {
    id: "usr-path-01",
    name: "Dr. Arvind Swaminathan, MD",
    email: "a.swaminathan@apexdiagnostics.com",
    role: "pathologist",
    title: "Chief Clinical Pathologist",
    badge: "Pathologist",
    department: "Diagnostic Pathology & Hematology",
    location: "Main Reference Lab (HQ)",
    avatarInitials: "AS",
    licenseNumber: "PATH-8839-2016",
  },
  lab_technician: {
    id: "usr-tech-01",
    name: "Sunita Patel, MLT",
    email: "sunita.p@apexdiagnostics.com",
    role: "lab_technician",
    title: "Senior Automated Analyzer Technologist",
    badge: "Lab Tech",
    department: "Automated Chemistry & Immunoassay",
    location: "Main Lab - Core Automation Line",
    avatarInitials: "SP",
    licenseNumber: "TECH-5521",
  },
  collection_staff: {
    id: "usr-coll-01",
    name: "Ramesh Verma",
    email: "ramesh.v@apexdiagnostics.com",
    role: "collection_staff",
    title: "Phlebotomy Lead & Accessioning Officer",
    badge: "Collection Staff",
    department: "Outpatient Phlebotomy & Accessioning",
    location: "Collection Center A (City Center)",
    avatarInitials: "RV",
    licenseNumber: "PHLEB-1092",
  },
  patient: {
    id: "usr-pat-01",
    name: "Rajesh Patel",
    email: "rajesh.patel92@gmail.com",
    role: "patient",
    title: "Patient / Consumer Portal",
    badge: "Patient",
    department: "Self-Service Diagnostics",
    location: "Home Collection (Sector 4)",
    avatarInitials: "RP",
    abdmHealthId: "91-4820-9942-1209",
  },
};
