/**
 * Role-Based Access Control (RBAC) & Authentication Model for Phase 1 MVP
 */

export type UserRole = "attending_physician" | "nurse_coordinator" | "patient";

export interface ClinicalUser {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  badge: string;
  department: string;
  abdmHealthId?: string;
  avatarInitials: string;
}

export interface RolePermissions {
  canViewSoapNotes: boolean;
  canPrescribeOrModifyPlan: boolean;
  canOverrideContraindications: boolean;
  canSignOffClinicalPlan: boolean;
  canExportFhir: boolean;
  canManageConsent: boolean;
  canViewPatientPlainSummary: boolean;
}

export const PRESET_USERS: Record<UserRole, ClinicalUser> = {
  attending_physician: {
    id: "usr-doc-01",
    name: "Dr. Priya Sharma, MD",
    role: "attending_physician",
    title: "Attending Emergency Physician",
    badge: "Clinician (MD)",
    department: "Emergency Medicine / Trauma",
    avatarInitials: "PS",
  },
  nurse_coordinator: {
    id: "usr-nurse-01",
    name: "Sunita Nair, RN",
    role: "nurse_coordinator",
    title: "Senior Clinical Nurse Coordinator",
    badge: "Nurse Coordinator",
    department: "Acute Inpatient Care",
    avatarInitials: "SN",
  },
  patient: {
    id: "usr-pat-01",
    name: "Rajesh Patel",
    role: "patient",
    title: "Patient / Caregiver",
    badge: "Patient Account",
    department: "Outpatient Cardiology",
    abdmHealthId: "91-4820-9942-1209",
    avatarInitials: "RP",
  },
};

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  attending_physician: {
    canViewSoapNotes: true,
    canPrescribeOrModifyPlan: true,
    canOverrideContraindications: true,
    canSignOffClinicalPlan: true,
    canExportFhir: true,
    canManageConsent: false,
    canViewPatientPlainSummary: true,
  },
  nurse_coordinator: {
    canViewSoapNotes: true,
    canPrescribeOrModifyPlan: false,
    canOverrideContraindications: false,
    canSignOffClinicalPlan: false,
    canExportFhir: true,
    canManageConsent: false,
    canViewPatientPlainSummary: true,
  },
  patient: {
    canViewSoapNotes: false,
    canPrescribeOrModifyPlan: false,
    canOverrideContraindications: false,
    canSignOffClinicalPlan: false,
    canExportFhir: false,
    canManageConsent: true,
    canViewPatientPlainSummary: true,
  },
};
