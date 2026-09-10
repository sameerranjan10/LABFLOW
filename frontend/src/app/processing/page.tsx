import { SplitScreenDashboard } from "@/components/SplitScreenDashboard";

export const metadata = {
  title: "Laboratory Processing & Workstations | LabFlow",
  description: "Technician worklist, automated analyzer ingestion, and QC monitoring",
};

export default function ProcessingPage() {
  return <SplitScreenDashboard initialView="processing" />;
}
