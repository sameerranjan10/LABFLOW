import { SplitScreenDashboard } from "@/components/SplitScreenDashboard";

export const metadata = {
  title: "Compliance Audit Trail | LabFlow",
  description: "21 CFR Part 11 and ISO 15189 compliant chronological audit trail",
};

export default function AuditPage() {
  return <SplitScreenDashboard initialView="audit" />;
}
