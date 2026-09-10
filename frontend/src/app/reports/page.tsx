import { SplitScreenDashboard } from "@/components/SplitScreenDashboard";

export const metadata = {
  title: "Diagnostic Reports & FHIR Delivery | LabFlow",
  description: "Dual-persona reports, digital signatures, and FHIR R4 interoperability",
};

export default function ReportsPage() {
  return <SplitScreenDashboard initialView="reports" />;
}
