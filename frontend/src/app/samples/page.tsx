import { SplitScreenDashboard } from "@/components/SplitScreenDashboard";

export const metadata = {
  title: "Specimen Tracking & Chain of Custody | LabFlow",
  description: "Track specimen custody, temperatures, collection barcodes, and lifecycle stages",
};

export default function SamplesPage() {
  return <SplitScreenDashboard initialView="samples" />;
}
