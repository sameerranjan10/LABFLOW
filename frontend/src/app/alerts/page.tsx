import { SplitScreenDashboard } from "@/components/SplitScreenDashboard";

export const metadata = {
  title: "Exceptions & Alerts | LabFlow",
  description: "Operational exceptions, SLA warnings, and critical panic values",
};

export default function AlertsPage() {
  return <SplitScreenDashboard initialView="alerts" />;
}
